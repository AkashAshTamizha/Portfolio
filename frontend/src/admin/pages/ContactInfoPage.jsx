import SingletonForm from "../components/SingletonForm";

const fields = [
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "availability", label: "Availability status", type: "text" },
  { name: "mapUrl", label: "Map embed URL", type: "url" },
  { name: "github", label: "GitHub", type: "url", group: "socials" },
  { name: "linkedin", label: "LinkedIn", type: "url", group: "socials" },
  { name: "twitter", label: "Twitter / X", type: "url", group: "socials" },
  { name: "instagram", label: "Instagram", type: "url", group: "socials" },
];

export default function ContactInfoPage() {
  return (
    <SingletonForm
      title="Contact Information"
      description="Contact details shown on your Contact page."
      apiPath="/contact-info"
      fields={fields}
    />
  );
}
