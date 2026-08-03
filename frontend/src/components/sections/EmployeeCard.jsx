// import { memo } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import Reveal from "../ui/Reveal";
// import RatingStars from "../ui/RatingStars";
// import { assetUrl } from "../../utils/api";

// function EmployeeCard({ employee, delay = 0 }) {
//   const photo = assetUrl(employee.photo);
//   const name = employee.user?.name || employee.employeeCode;

//   return (
//     <Reveal delay={delay}>
//       <motion.article
//         whileHover={{ y: -6 }}
//         transition={{ duration: 0.25, ease: "easeOut" }}
//         className="card-surface overflow-hidden group h-full flex flex-col p-6 text-center items-center"
//       >
//         <Link to={`/team/${employee._id}`} className="block">
//           <div className="h-24 w-24 rounded-full overflow-hidden bg-ink-800 [html.light_&]:bg-paper-200 border border-ink-700 [html.light_&]:border-paper-300 mx-auto">
//             {photo ? (
//               <img
//                 src={photo}
//                 alt={name}
//                 className="h-full w-full object-cover"
//                 onError={(e) => (e.currentTarget.style.display = "none")}
//               />
//             ) : (
//               <div className="h-full w-full flex items-center justify-center text-2xl font-display text-cloud-500">
//                 {name?.[0]?.toUpperCase()}
//               </div>
//             )}
//           </div>
//         </Link>

//         <Link to={`/team/${employee._id}`}>
//           <h3 className="mt-4 text-lg font-semibold font-display hover:text-blue-400 transition-colors">{name}</h3>
//         </Link>
//         {employee.designation && <p className="text-sm text-cloud-500 mt-1">{employee.designation}</p>}
//         {employee.experience > 0 && (
//           <p className="text-xs text-cloud-600 mt-1">{employee.experience} yrs experience</p>
//         )}

//         {employee.skills?.length > 0 && (
//           <div className="mt-4 flex flex-wrap justify-center gap-2">
//             {employee.skills.slice(0, 4).map((s) => (
//               <span key={s.skill?._id || s.skill} className="tag-chip">
//                 {s.skill?.name}
//               </span>
//             ))}
//           </div>
//         )}

//         <div className="mt-4">
//           <RatingStars value={employee.stats?.avgRating || 0} count={employee.stats?.reviewCount} />
//         </div>

//         <Link to={`/team/${employee._id}`} className="btn-secondary mt-5 text-sm">
//           View Profile
//         </Link>
//       </motion.article>
//     </Reveal>
//   );
// }

// export default memo(EmployeeCard);





import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";
import { assetUrl } from "../../utils/api";

function EmployeeCard({ employee, delay = 0 }) {
  const photo = assetUrl(employee.photo);
  const name = employee.user?.name || employee.employeeCode;

  return (
    <Reveal delay={delay}>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="card-surface overflow-hidden group h-full flex flex-col p-4 sm:p-6 text-center items-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
      >
        <Link to={`/team/${employee._id}`} className="block w-full">
          {/* Profile Image - Responsive square with rounded corners */}
          <div className="aspect-square w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-ink-800 [html.light_&]:bg-paper-200 border border-ink-700 [html.light_&]:border-paper-300 shadow-lg transition-shadow hover:shadow-xl">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="h-full w-full object-cover object-center"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-4xl sm:text-5xl font-display text-cloud-500">
                {name?.slice(0, 2).toUpperCase() || "?"}
              </div>
            )}
          </div>
        </Link>

        {/* Name - Responsive text */}
        <Link to={`/team/${employee._id}`} className="w-full">
          <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl font-semibold font-display hover:text-blue-400 transition-colors truncate max-w-full px-2">
            {name}
          </h3>
        </Link>

        {/* Designation / Title */}
        {employee.designation && (
          <p className="text-xs sm:text-sm text-cloud-500 mt-0.5 truncate max-w-full px-2">
            {employee.designation}
          </p>
        )}

        {/* Experience */}
        {employee.experience > 0 && (
          <p className="text-[10px] sm:text-xs text-cloud-600 mt-0.5">
            {employee.experience} yrs experience
          </p>
        )}

        {/* Stats - Responsive grid for mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-ink-700 [html.light_&]:border-paper-300 w-full">
          <div className="text-center">
            <span className="block text-base sm:text-lg md:text-xl font-semibold font-display">
              {employee.experience || 524}
            </span>
            <span className="text-[10px] sm:text-xs text-cloud-500">Years</span>
          </div>
          <div className="text-center">
            <span className="block text-base sm:text-lg md:text-xl font-semibold font-display">
              {employee.employeeCode || 16}
            </span>
            <span className="text-[10px] sm:text-xs text-cloud-500">Code</span>
          </div>
          <div className="text-center">
            <span className="block text-base sm:text-lg md:text-xl font-semibold font-display text-blue-400">
              +
            </span>
            <span className="text-[10px] sm:text-xs text-cloud-500">Follow</span>
          </div>
        </div>

        {/* Skills - Responsive chips */}
        {employee.skills?.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1 sm:gap-1.5 px-1">
            {employee.skills.slice(0, 4).map((s) => (
              <span 
                key={s.skill?._id || s.skill} 
                className="tag-chip text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 truncate max-w-[80px] sm:max-w-[100px]"
              >
                {s.skill?.name}
              </span>
            ))}
            {employee.skills.length > 4 && (
              <span className="tag-chip text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                +{employee.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* View Profile Button - Responsive */}
        <Link 
          to={`/team/${employee._id}`} 
          className="btn-secondary mt-3 sm:mt-4 text-xs sm:text-sm w-full py-1.5 sm:py-2 px-3 sm:px-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          View Profile
        </Link>
      </motion.article>
    </Reveal>
  );
}

export default memo(EmployeeCard);
