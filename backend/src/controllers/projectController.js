import Project from "../models/Project.js";
import Employee from "../models/Employee.js";
import { crudFactory } from "../utils/crudFactory.js";
import { recalcEmployeeProjectCount } from "../utils/recalcStats.js";

const baseController = crudFactory(Project, {
  searchFields: ["name", "category", "description", "tech"],
  filterFields: ["category", "featured", "status"],
});

// Admin: add an employee to a project's team with their role/contribution.
export async function assignTeamMember(req, res, next) {
  try {
    const { employee, role, contribution } = req.body;

    if (!(await Employee.exists({ _id: employee }))) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const already = project.team.find((t) => String(t.employee) === String(employee));
    if (already) {
      already.role = role ?? already.role;
      already.contribution = contribution ?? already.contribution;
    } else {
      project.team.push({ employee, role, contribution });
    }

    await project.save();
    await recalcEmployeeProjectCount(employee);

    res.json({ success: true, message: "Team member assigned.", data: project });
  } catch (err) {
    next(err);
  }
}

export async function removeTeamMember(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    project.team = project.team.filter((t) => String(t.employee) !== String(req.params.employeeId));
    await project.save();
    await recalcEmployeeProjectCount(req.params.employeeId);

    res.json({ success: true, message: "Team member removed.", data: project });
  } catch (err) {
    next(err);
  }
}

export default baseController;
