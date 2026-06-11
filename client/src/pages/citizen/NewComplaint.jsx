import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getWards, createComplaint } from '../../api/complaints';
import { CATEGORIES } from '../../utils/constants';

const STEPS = ['Category', 'Details', 'Location', 'Review'];

const NewComplaint = () => {
  const navigate  = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    category:    '',
    title:       '',
    description: '',
    priority:    'medium',
    wardId:      '',
    address:     '',
    lat:         '',
    lng:         '',
    images:      [],
  });
  const [previews, setPreviews] = useState([]);

  const { data: wardsData } = useQuery({
    queryKey: ['wards'],
    queryFn: getWards,
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    update('images', files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('lat', pos.coords.latitude);
        update('lng', pos.coords.longitude);
        toast.success('Location captured!');
      },
      () => toast.error('Could not get location. Select ward manually.')
    );
  };

  const canNext = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return form.title.length >= 5 && form.description.length >= 10;
    if (step === 2) return !!form.wardId;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('category',    form.category);
      fd.append('priority',    form.priority);
      fd.append('wardId',      form.wardId);
      fd.append('address',     form.address);
      if (form.lat) fd.append('lat', form.lat);
      if (form.lng) fd.append('lng', form.lng);
      form.images.forEach((img) => fd.append('images', img));

      await createComplaint(fd);
      toast.success('Complaint filed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const wards = wardsData?.wards || [];
  const selectedCategory = CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">New Complaint</h1>
      <p className="text-sm text-gray-500 mb-6">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="card p-6">

        {/* Step 0 — Category */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">
              What type of issue is this?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => update('category', cat.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    form.category === cat.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Describe the issue
            </h2>

            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="Short summary of the issue"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Describe the problem in detail..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="label">Photos (optional, max 3)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="input py-2"
                onChange={handleImages}
              />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {previews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Where is the issue?
            </h2>

            <div>
              <label className="label">Select Ward</label>
              <select
                className="input"
                value={form.wardId}
                onChange={(e) => update('wardId', e.target.value)}
              >
                <option value="">-- Select your ward --</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    Ward {w.wardNumber} — {w.wardName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Address (optional)</label>
              <input
                className="input"
                placeholder="Street name, landmark..."
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={getLocation}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              📍 Use my current GPS location
            </button>

            {form.lat && form.lng && (
              <p className="text-sm text-green-600 text-center">
                ✓ Location captured: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Review your complaint
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{selectedCategory?.icon} {selectedCategory?.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Title</span>
                <span className="font-medium text-right max-w-[60%]">{form.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Priority</span>
                <span className="font-medium capitalize">{form.priority}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Ward</span>
                <span className="font-medium">
                  {wards.find((w) => w._id === form.wardId)?.wardName || '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Photos</span>
                <span className="font-medium">{form.images.length} attached</span>
              </div>
              {form.lat && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">GPS</span>
                  <span className="font-medium text-green-600">✓ Captured</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              Once submitted, your complaint will be assigned to a ward officer for resolution.
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-secondary"
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="btn-primary"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Submitting...' : '✓ Submit Complaint'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NewComplaint;