import { useState } from "react";
import toast from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import { sendContactMessage } from "../../utils/api";

const initialState = { name: "", email: "", subject: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.subject.trim()) errors.subject = "Subject is required.";
  if (!values.message.trim()) {
    errors.message = "Message is required.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await sendContactMessage(values);
      toast.success("Message sent! I'll get back to you soon.");
      setValues(initialState);
    } catch (err) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="name" className="sr-only">Your Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="input-field"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <p id="name-error" className="text-xs text-coral-500 mt-1.5">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="sr-only">Your Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="input-field"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="text-xs text-coral-500 mt-1.5">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="sr-only">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={values.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="input-field"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {errors.subject && <p id="subject-error" className="text-xs text-coral-500 mt-1.5">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="input-field resize-none"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <p id="message-error" className="text-xs text-coral-500 mt-1.5">{errors.message}</p>}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? "Sending..." : "Send Message"}
        <FiSend className="h-4 w-4" />
      </button>
    </form>
  );
}
