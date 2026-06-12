import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getComplaintById,
  reopenComplaint,
  submitFeedback,
  updateStatus,
  uploadAfterImage,
} from '../../api/complaints';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import TimelineView from '../../components/complaint/TimelineView';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES } from '../../utils/constants';

const ComplaintDetail = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const queryClient     = useQueryClient();
  const { user }        = useAuthStore();

  const [remark, setRemark]       = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn:  () => getComplaintById(id),
  });

  const complaint = data?.complaint;
  const category  = CATEGORIES.find(c => c.value === complaint?.category);

  const invalidate = () => {
    queryClient.invalidateQueries(['complaint', id]);
    queryClient.invalidateQueries(['my-complaints']);
  };

  const statusMutation = useMutation({
    mutationFn: () => updateStatus(id, { status: newStatus, remark }),
    onSuccess: () => { toast.success('Status updated'); invalidate(); setRemark(''); setNewStatus(''); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenComplaint(id, remark),
    onSuccess: () => { toast.success('Complaint reopened'); invalidate(); setRemark(''); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const feedbackMutation = useMutation({
    mutationFn: () => submitFeedback(id, { rating, comment }),
    onSuccess: () => { toast.success('Feedback submitted! Thank you'); invalidate(); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const afterImageMutation = useMutation({
    mutationFn: (file) => uploadAfterImage(id, file),
    onSuccess: () => { toast.success('Resolution image uploaded'); invalidate(); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-1/2 rounded" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-60 rounded-xl" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Complaint not found</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm">Go back</button>
      </div>
    );
  }

  const isOfficer  = user?.role === 'ward_officer';
  const isAdmin    = user?.role === 'admin';
  const isCitizen  = user?.role === 'citizen';
  const isResolved = complaint.status === 'resolved';
  const canReopen  = isCitizen && isResolved && !complaint.feedback?.rating;
  const canFeedback= isCitizen && isResolved && !complaint.feedback?.rating;

  const STATUS_OPTIONS = {
    assigned:    ['in_progress'],
    in_progress: ['resolved'],
    reopened:    ['in_progress'],
  };
  const nextStatuses = STATUS_OPTIONS[complaint.status] || [];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-xl">
              {category?.icon || '📋'}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{complaint.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Ward: {complaint.ward?.wardName} · Filed by {complaint.citizen?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{complaint.description}</p>

        {complaint.location?.address && (
          <p className="text-xs text-gray-400 mt-3">
            📍 {complaint.location.address}
          </p>
        )}
      </div>

      {/* Before/After images */}
      {(complaint.images?.before?.length > 0 || complaint.images?.after?.length > 0) && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {complaint.images?.before?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">BEFORE</p>
                <div className="space-y-2">
                  {complaint.images.before.map((url, i) => (
                    <img key={i} src={url} alt="before" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
            {complaint.images?.after?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">AFTER</p>
                <div className="space-y-2">
                  {complaint.images.after.map((url, i) => (
                    <img key={i} src={url} alt="after" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Officer actions */}
      {(isOfficer || isAdmin) && nextStatuses.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h2>
          <div className="space-y-3">
            <select
              className="input"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
            >
              <option value="">Select new status</option>
              {nextStatuses.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Add a remark (optional)"
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
            <button
              onClick={() => statusMutation.mutate()}
              disabled={!newStatus || statusMutation.isPending}
              className="btn-primary w-full"
            >
              {statusMutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      )}

      {/* Officer: upload resolution image */}
      {isOfficer && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Upload Resolution Image</h2>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="input py-2"
            onChange={e => {
              if (e.target.files[0]) afterImageMutation.mutate(e.target.files[0]);
            }}
          />
          {afterImageMutation.isPending && (
            <p className="text-sm text-primary-600 mt-2">Uploading...</p>
          )}
        </div>
      )}

      {/* Citizen: reopen */}
      {canReopen && (
        <div className="card p-5 border-amber-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Issue not resolved?</h2>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Explain why the issue is still not resolved..."
            value={remark}
            onChange={e => setRemark(e.target.value)}
          />
          <button
            onClick={() => reopenMutation.mutate()}
            disabled={reopenMutation.isPending}
            className="btn-secondary w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {reopenMutation.isPending ? 'Reopening...' : '🔄 Reopen Complaint'}
          </button>
        </div>
      )}

      {/* Citizen: feedback */}
      {canFeedback && (
        <div className="card p-5 border-green-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Rate the resolution</h2>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'opacity-100' : 'opacity-30'}`}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Any comments? (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button
            onClick={() => feedbackMutation.mutate()}
            disabled={!rating || feedbackMutation.isPending}
            className="btn-primary w-full mt-3"
          >
            {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}

      {/* Existing feedback */}
      {complaint.feedback?.rating && (
        <div className="card p-5 bg-green-50 border-green-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Your Feedback</h2>
          <div className="text-lg mb-1">
            {'⭐'.repeat(complaint.feedback.rating)}
          </div>
          {complaint.feedback.comment && (
            <p className="text-sm text-gray-600">{complaint.feedback.comment}</p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h2>
        <TimelineView timeline={complaint.timeline} />
      </div>
    </div>
  );
};

export default ComplaintDetail;