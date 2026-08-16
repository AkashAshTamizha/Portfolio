import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuTrash2 } from "react-icons/lu";
import { api } from "../api/client";

export default function ReviewsPage() {
  const [employees, setEmployees] = useState([]);
  const [reviewsByEmployee, setReviewsByEmployee] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const empRes = await api.get("/employees?limit=200");
      const employeeList = empRes.data || [];
      setEmployees(employeeList);

      const entries = await Promise.all(
        employeeList.map(async (emp) => {
          const r = await api.get(`/reviews/employee/${emp._id}`);
          return [emp._id, r.data || []];
        })
      );
      setReviewsByEmployee(Object.fromEntries(entries));
    } catch (err) {
      toast.error(err.message || "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(review) {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      toast.success("Review deleted.");
      load();
    } catch (err) {
      toast.error(err.message || "Could not delete review.");
    }
  }

  const allReviews = employees.flatMap((emp) =>
    (reviewsByEmployee[emp._id] || []).map((r) => ({ ...r, employeeName: emp.user?.name || emp.employeeCode }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display">Reviews</h1>
        <p className="text-sm text-cloud-500 mt-1">Moderate reviews submitted by registered users.</p>
      </div>

      {loading ? (
        <p className="text-sm text-cloud-500">Loading…</p>
      ) : allReviews.length === 0 ? (
        <p className="text-sm text-cloud-500">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {allReviews.map((review) => (
            <div key={review._id} className="card-surface p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-cloud-500">
                  <span className="text-cloud-300 font-medium">{review.user?.name || "Anonymous"}</span> reviewed{" "}
                  <span className="text-cloud-300 font-medium">{review.employeeName}</span>
                </p>
                <p className="text-sm text-cloud-400 mt-2">{review.text}</p>
              </div>
              <button
                onClick={() => handleDelete(review)}
                className="p-2 rounded-lg text-cloud-400 hover:bg-ink-700 hover:text-coral-400 shrink-0"
                aria-label="Delete review"
              >
                <LuTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
