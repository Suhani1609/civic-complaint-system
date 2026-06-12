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
    category: '', title: '', description: '',
    priority: 'medium', wardId: '', address: '',
    lat: '', lng: '', images: [],
  });
  const [previews, setPreviews] = useState([]);

  const { data: wardsData } = useQuery({
    queryKey: ['wards'],
    queryFn: getWards,
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    update('images', files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    toast.loading('Getting your location...', { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('lat', pos.coords.latitude);
        update('lng', pos.coords.longitude);
        toast.success('Location captured!', { id: 'loc' });
      },
      () => toast.error('Could not get location. Select ward manually.', { id: 'loc' })
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
      form.images.forEach(img => fd.append('images', img));
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
  const selectedCategory = CATEGORIES.find(c => c.value === form.category);
  const selectedWard     = wards.find(w => w._id === form.wardId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">File a Complaint</h1>
        <p className="text-sm text-slate-500 mt-1">
          Step {step + 1} of {STEPS.length} — <span className="font-medium text-slate-700">{STEPS[step]}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 relative">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              i < step ? 'bg-violet-600' :
              i === step ? 'bg-violet-400' :
              'bg-slate-200'
            }`} />
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <span className={`text-xs font-medium ${
              i === step ? 'text-violet-600' : 'text-slate-400'
            }`}>{s}</span>
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="card p-6">

        {/* ── Step 0: Category ── */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              What type of issue is this?
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Select the category that best describes your complaint.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => update('category', cat.value)}
                  className={`
                    p-4 rounded-2xl border-2 text-center transition-all duration-150 cursor-pointer
                    ${form.category === cat.value
                      ? 'border-violet-500 bg-violet-50 shadow-sm scale-[1.02]'
                      : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-xs font-semibold text-slate-700 leading-tight">
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                Describe the issue
              </h2>
              <p className="text-sm text-slate-500">
                Be specific — a detailed description helps officers resolve faster.
              </p>
            </div>

            <div>
              <label className="label">Title <span className="text-red-400">*</span></label>
              <input
                className="input"
                placeholder="e.g. Large pothole on main road near school"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-slate-400">Minimum 5 characters</p>
                <p className="text-xs text-slate-400">{form.title.length}/100</p>
              </div>
            </div>

            <div>
              <label className="label">Description <span className="text-red-400">*</span></label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="Describe the exact location, severity, how long the issue has existed, and any other relevant details..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                maxLength={1000}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-slate-400">Minimum 10 characters</p>
                <p className="text-xs text-slate-400">{form.description.length}/1000</p>
              </div>
            </div>

            <div>
              <label className="label">Priority Level</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'low',      label: 'Low',      color: 'slate',  desc: 'Minor issue' },
                  { value: 'medium',   label: 'Medium',   color: 'blue',   desc: 'Moderate'    },
                  { value: 'high',     label: 'High',     color: 'amber',  desc: 'Urgent'      },
                  { value: 'critical', label: 'Critical', color: 'red',    desc: 'Emergency'   },
                ].map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => update('priority', p.value)}
                    className={`
                      p-3 rounded-xl border-2 text-center transition-all duration-150
                      ${form.priority === p.value
                        ? `border-${p.color}-400 bg-${p.color}-50`
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="text-xs font-semibold text-slate-800">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Photos <span className="text-slate-400 font-normal">(optional, max 3)</span></label>
              <label className="
                flex flex-col items-center justify-center w-full h-32
                border-2 border-dashed border-slate-300 rounded-2xl
                cursor-pointer hover:border-violet-400 hover:bg-violet-50
                transition-all duration-150
              ">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-sm text-slate-500 font-medium">
                  Tap to upload or take photo
                </span>
                <span className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP · Max 5MB each</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={handleImages}
                />
              </label>

              {previews.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {previews.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`preview ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                      />
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                Where is the issue?
              </h2>
              <p className="text-sm text-slate-500">
                Select your ward and optionally share your GPS location.
              </p>
            </div>

            <div>
              <label className="label">Ward <span className="text-red-400">*</span></label>
              <select
                className="input"
                value={form.wardId}
                onChange={e => update('wardId', e.target.value)}
              >
                <option value="">— Select your ward —</option>
                {wards.map(w => (
                  <option key={w._id} value={w._id}>
                    Ward {w.wardNumber} — {w.wardName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Street Address <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                className="input"
                placeholder="e.g. Near Alkapuri circle, opposite SBI bank"
                value={form.address}
                onChange={e => update('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="label">GPS Location <span className="text-slate-400 font-normal">(optional but recommended)</span></label>
              <button
                type="button"
                onClick={getLocation}
                className="btn-secondary w-full gap-2"
              >
                <span>📍</span>
                Use my current location
              </button>

              {form.lat && form.lng && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Location captured</p>
                    <p className="text-xs text-emerald-600">
                      {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                Review your complaint
              </h2>
              <p className="text-sm text-slate-500">
                Please review the details before submitting.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              {[
                { label: 'Category',    value: `${selectedCategory?.icon} ${selectedCategory?.label}` },
                { label: 'Title',       value: form.title },
                { label: 'Priority',    value: form.priority.charAt(0).toUpperCase() + form.priority.slice(1) },
                { label: 'Ward',        value: selectedWard ? `Ward ${selectedWard.wardNumber} — ${selectedWard.wardName}` : '—' },
                { label: 'Address',     value: form.address || '—' },
                { label: 'GPS',         value: form.lat ? `${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)}` : 'Not captured' },
                { label: 'Photos',      value: form.images.length > 0 ? `${form.images.length} photo(s) attached` : 'None' },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                  i !== 0 ? 'border-t border-slate-200' : ''
                }`}>
                  <span className="text-slate-500 font-medium flex-shrink-0">{row.label}</span>
                  <span className="text-slate-900 font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Description preview */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 leading-relaxed">
                {form.description}
              </p>
            </div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Attached Photos
                </p>
                <div className="flex gap-3">
                  {previews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`photo ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                Once submitted, your complaint will be reviewed and assigned to the concerned ward officer. You will be notified of status updates.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Back
        </button>

        <span className="text-xs text-slate-400 font-medium">
          {step + 1} / {STEPS.length}
        </span>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="btn-primary disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canNext()}
            className="btn-primary px-8 disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : '✓ Submit Complaint'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NewComplaint;