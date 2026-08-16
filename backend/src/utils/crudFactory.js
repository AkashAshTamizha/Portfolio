import { validationResult } from "express-validator";

/**
 * Generic CRUD controller factory shared by every list-type resource
 * (Skills, Services, Experience, Education, Certifications, Projects).
 *
 * options:
 *  - searchFields: string[]  -> fields matched against ?search= (case-insensitive regex)
 *  - filterFields: string[]  -> fields allowed as exact-match ?field=value filters
 *  - defaultSort: string     -> mongoose sort string, default "order -createdAt"
 */
export function crudFactory(Model, options = {}) {
  const { searchFields = [], filterFields = [], defaultSort = "order -createdAt" } = options;

  async function getAll(req, res, next) {
    try {
      const { search, page = 1, limit = 100, sort } = req.query;
      const query = {};

      if (search && searchFields.length) {
        query.$or = searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
      }

      filterFields.forEach((field) => {
        if (req.query[field] !== undefined && req.query[field] !== "") {
          query[field] = req.query[field];
        }
      });

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        Model.find(query)
          .sort(sort || defaultSort)
          .skip(skip)
          .limit(limitNum),
        Model.countDocuments(query),
      ]);

      res.json({
        success: true,
        count: items.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async function getOne(req, res, next) {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${Model.modelName} not found.` });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async function create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
      }
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, message: `${Model.modelName} created successfully.`, data: item });
    } catch (err) {
      next(err);
    }
  }

  async function update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
      }
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) {
        return res.status(404).json({ success: false, message: `${Model.modelName} not found.` });
      }
      res.json({ success: true, message: `${Model.modelName} updated successfully.`, data: item });
    } catch (err) {
      next(err);
    }
  }

  async function remove(req, res, next) {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${Model.modelName} not found.` });
      }
      res.json({ success: true, message: `${Model.modelName} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }

  return { getAll, getOne, create, update, remove };
}
