import SingletonForm from "../components/SingletonForm";

const fields = [
  { name: "name", label: "Full name", type: "text", required: true },
  { name: "initials", label: "Initials (for logo)", type: "text", maxLength: 6, helpText: "Up to 6 characters, e.g. \"AM\" — shown in the logo/avatar fallback." },
  { name: "role", label: "Role / Title", type: "text" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "heroTyped", label: "Hero typed roles", type: "tags", placeholder: "One per comma" },
  { name: "bio", label: "Bio", type: "textarea", rows: 6 },
  {
    name: "specializations",
    label: "Specializations",
    type: "tags",
    placeholder: "One per comma, e.g. Building REST APIs, Designing databases",
    helpText: "Shown as a checklist on the About Me page.",
  },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "yearsExperience", label: "Years of experience", type: "number" },
  { name: "availability", label: "Availability status", type: "text" },
  { name: "resumeUrl", label: "Resume URL", type: "url" },
  { name: "github", label: "GitHub", type: "url", group: "socials" },
  { name: "linkedin", label: "LinkedIn", type: "url", group: "socials" },
  { name: "twitter", label: "Twitter / X", type: "url", group: "socials" },
  { name: "instagram", label: "Instagram", type: "url", group: "socials" },
];

export default function ProfilePage() {
  return (
    <SingletonForm
      title="Profile"
      description="Your personal information, shown across the site."
      apiPath="/profile"
      fields={fields}
      imageField="avatar"
      uploadType="profile"
    />
  );
}
