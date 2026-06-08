const Application = require(
  "../models/Application"
);

exports.applyJob = async (
  req,
  res
) => {
  try {
    const application =
      await Application.create({
        jobId: req.params.id,
        ...req.body,
      });

    res.status(201).json(
      application
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getApplications =
  async (req, res) => {
    try {
      const applications =
        await Application.find({
          jobId: req.params.id,
        });

      res.json(applications);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };