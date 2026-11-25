import {useEffect, useState, type FormEvent} from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';
import {
  buildEnquiryWhatsAppMessage,
  buildWhatsAppUrl,
  formatIndianPhone,
  generateEnquiryRef,
  validateEnquiryForm,
  type EnquiryCategory,
  type EnquiryFormInput,
  type EnquiryValidationErrors,
  type ValidatedEnquiry,
} from '../utils/enquiry';
import {ShopLocationMap} from './ShopLocationMap';

interface ContactSectionProps {
  preselectedCategory?: EnquiryCategory | '';
  preselectedNote?: string;
}

const ENQUIRY_CATEGORIES: EnquiryCategory[] = [
  'Car Battery',
  'Two-Wheeler Battery',
  'Home Inverter Battery',
  'Inverter & Battery Combo',
  'Battery Check / Other',
];

export function ContactSection({
  preselectedCategory = '',
  preselectedNote = '',
}: ContactSectionProps) {
  const [formState, setFormState] = useState<EnquiryFormInput>({
    name: '',
    phone: '',
    category: preselectedCategory,
    modelOrRequirement: preselectedNote,
    area: '',
    message: '',
  });
  const [errors, setErrors] = useState<EnquiryValidationErrors>({});
  const [submittedEnquiry, setSubmittedEnquiry] =
    useState<ValidatedEnquiry | null>(null);

  useEffect(() => {
    if (preselectedCategory) {
      setSubmittedEnquiry(null);
      setFormState((prev) => ({
        ...prev,
        category: preselectedCategory,
        modelOrRequirement: preselectedNote || prev.modelOrRequirement,
      }));
      setErrors((prev) => ({...prev, category: undefined}));
    }
  }, [preselectedCategory, preselectedNote]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateEnquiryForm(formState);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const enquiry: ValidatedEnquiry = {
      referenceId: generateEnquiryRef(),
      name: formState.name.trim(),
      phone: validation.normalizedPhone,
      formattedPhone: formatIndianPhone(validation.normalizedPhone),
      category: formState.category as EnquiryCategory,
      modelOrRequirement: formState.modelOrRequirement.trim(),
      area: formState.area.trim(),
      message: formState.message.trim(),
      submittedAt: new Date().toISOString(),
    };

    setErrors({});
    setSubmittedEnquiry(enquiry);
  };

  const handleReset = () => {
    setSubmittedEnquiry(null);
    setFormState({
      name: '',
      phone: '',
      category: '',
      modelOrRequirement: '',
      area: '',
      message: '',
    });
    setErrors({});
  };

  const quickWhatsAppUrl = buildWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hello Krishna Battery Service, I would like to enquire about battery availability and pricing.',
  );

  return (
    <section
      id="contact"
      className="py-16 lg:py-24 bg-slate-50 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-sm font-semibold text-amber-700 mb-3">
            Contact &amp; Location
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-4">
            Visit Krishna Battery Service in Mugalivakkam or Send an Enquiry
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Call us directly for immediate assistance, message us on WhatsApp
            for quick stock checks, or fill out the enquiry form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left column: Store details + Interactive Google Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200 space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-4">
                  Shop Details
                </h3>

                <dl className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <Phone
                      className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Mobile Number
                      </dt>
                      <dd className="mt-0.5">
                        <a
                          href={BUSINESS_INFO.phoneHref}
                          className="text-lg font-bold text-navy-900 hover:text-amber-700 transition-colors font-mono tabular-nums"
                        >
                          {BUSINESS_INFO.phoneDisplay}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MapPin
                      className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Complete Address
                      </dt>
                      <dd className="mt-0.5 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {BUSINESS_INFO.addressLine1},{' '}
                        {BUSINESS_INFO.addressLine2},{' '}
                        {BUSINESS_INFO.cityStatePin}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock
                      className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Business Hours
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-600">
                        {BUSINESS_INFO.hoursPlaceholder}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Call {BUSINESS_INFO.phoneRaw}</span>
                </a>
                <a
                  href={quickWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp Shop</span>
                </a>
              </div>
            </div>

            <ShopLocationMap />
          </div>

          {/* Right column: Validated Battery Enquiry Form */}
          <div
            id="enquiry-form"
            className="lg:col-span-6 p-6 sm:p-8 bg-white rounded-xl border border-slate-200 scroll-mt-24"
          >
            {submittedEnquiry ? (
              <div
                data-testid="enquiry-confirmation"
                className="space-y-6"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 text-emerald-700 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-mono font-semibold text-emerald-700">
                      Reference {submittedEnquiry.referenceId}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-navy-900 mt-1">
                      Enquiry Ready to Send
                    </h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      Thank you, {submittedEnquiry.name}. Your battery enquiry
                      details are captured below. Tap WhatsApp to send this
                      formatted request directly to Krishna Battery Service, or
                      call us right away.
                    </p>
                  </div>
                </div>

                <dl className="divide-y divide-slate-200 border-t border-b border-slate-200 text-sm">
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-slate-500">Customer Name</dt>
                    <dd className="font-medium text-navy-900 text-right">
                      {submittedEnquiry.name}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-slate-500">Mobile Number</dt>
                    <dd className="font-mono font-medium text-navy-900 tabular-nums text-right">
                      {submittedEnquiry.formattedPhone}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <dt className="text-slate-500">Requirement</dt>
                    <dd className="font-medium text-navy-900 text-right">
                      {submittedEnquiry.category}
                    </dd>
                  </div>
                  {submittedEnquiry.modelOrRequirement && (
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Vehicle / System</dt>
                      <dd className="font-medium text-navy-900 text-right">
                        {submittedEnquiry.modelOrRequirement}
                      </dd>
                    </div>
                  )}
                  {submittedEnquiry.area && (
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Locality</dt>
                      <dd className="font-medium text-navy-900 text-right">
                        {submittedEnquiry.area}
                      </dd>
                    </div>
                  )}
                  {submittedEnquiry.message && (
                    <div className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500">Notes</dt>
                      <dd className="font-medium text-navy-900 text-right max-w-xs">
                        {submittedEnquiry.message}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={buildWhatsAppUrl(
                      BUSINESS_INFO.whatsappNumber,
                      buildEnquiryWhatsAppMessage(submittedEnquiry),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Send Enquiry on WhatsApp</span>
                  </a>

                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-navy-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span>Call Shop</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-medium text-slate-600 hover:text-navy-900 underline"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-2xl font-bold text-navy-900 mb-2">
                  Send a Battery Enquiry
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Share your requirement below to prepare a structured enquiry
                  for Krishna Battery Service.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="enquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formState.name}
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        if (errors.name) {
                          setErrors((prev) => ({...prev, name: undefined}));
                        }
                      }}
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors ${
                        errors.name
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-slate-300 focus:border-navy-900'
                      }`}
                    />
                    {errors.name && (
                      <p
                        id="enquiry-name-error"
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-red-700"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Mobile Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formState.phone}
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                        if (errors.phone) {
                          setErrors((prev) => ({...prev, phone: undefined}));
                        }
                      }}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? 'enquiry-phone-error' : undefined
                      }
                      className={`w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border bg-white text-slate-900 placeholder:font-sans placeholder:text-slate-400 transition-colors ${
                        errors.phone
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-slate-300 focus:border-navy-900'
                      }`}
                    />
                    {errors.phone && (
                      <p
                        id="enquiry-phone-error"
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-red-700"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-category"
                      className="block text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Battery / Service Category{' '}
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="enquiry-category"
                      name="category"
                      value={formState.category}
                      onChange={(e) => {
                        setFormState((prev) => ({
                          ...prev,
                          category: e.target.value as EnquiryCategory | '',
                        }));
                        if (errors.category) {
                          setErrors((prev) => ({...prev, category: undefined}));
                        }
                      }}
                      aria-invalid={Boolean(errors.category)}
                      aria-describedby={
                        errors.category ? 'enquiry-category-error' : undefined
                      }
                      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 transition-colors ${
                        errors.category
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-slate-300 focus:border-navy-900'
                      }`}
                    >
                      <option value="">Select requirement type</option>
                      {ENQUIRY_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p
                        id="enquiry-category-error"
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-red-700"
                      >
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="enquiry-model"
                        className="block text-sm font-semibold text-slate-800 mb-1.5"
                      >
                        Vehicle Model or Backup Load
                      </label>
                      <input
                        id="enquiry-model"
                        name="modelOrRequirement"
                        type="text"
                        value={formState.modelOrRequirement}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            modelOrRequirement: e.target.value,
                          }))
                        }
                        placeholder="e.g. Car model or 2BHK inverter"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-navy-900 bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-area"
                        className="block text-sm font-semibold text-slate-800 mb-1.5"
                      >
                        Your Locality in Chennai
                      </label>
                      <input
                        id="enquiry-area"
                        name="area"
                        type="text"
                        value={formState.area}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            area: e.target.value,
                          }))
                        }
                        placeholder="e.g. Mugalivakkam, Porur"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-navy-900 bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-message"
                      className="block text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Additional Details (Optional)
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={3}
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Mention current battery issue, fuel type, or preferred callback time"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-navy-900 bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Submit Enquiry</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
