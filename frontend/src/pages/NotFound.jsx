import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Seo from "../components/ui/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" path="/404" />
      <div className="section-pad">
        <div className="container-content text-center py-20">
          <p className="font-mono text-blue-400 text-sm mb-4">{'// Error 404'}</p>
          <h1 className="text-4xl sm:text-5xl font-semibold font-display">Page not found</h1>
          <p className="mt-4 text-cloud-500">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link to="/" className="btn-primary inline-flex mt-8">
            <FiArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
