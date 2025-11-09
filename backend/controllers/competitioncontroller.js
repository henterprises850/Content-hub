import Competition from "../models/Competition.js";

export const createCompetition = async (req, res) => {
  try {
    const competition = await Competition.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      competition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCompetitions = async (req, res) => {
  try {
    const status = req.query.status;
    let query = {};

    if (status) {
      query.status = status;
    }

    const competitions = await Competition.find(query)
      .populate("createdBy", "name")
      .sort({ startDate: -1 });

    res.json({
      success: true,
      competitions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar email");

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    res.json({
      success: true,
      competition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    if (new Date() > competition.registrationDeadline) {
      return res
        .status(400)
        .json({ message: "Registration deadline has passed" });
    }

    if (
      competition.maxParticipants &&
      competition.participants.length >= competition.maxParticipants
    ) {
      return res.status(400).json({ message: "Competition is full" });
    }

    const alreadyRegistered = competition.participants.some(
      (p) => p.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "Already registered for this competition" });
    }

    competition.participants.push({
      user: req.user.id,
      answers: req.body.answers || {},
    });

    await competition.save();

    res.json({
      success: true,
      message: "Successfully registered for competition",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompetition = async (req, res) => {
  try {
    let competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    if (
      competition.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this competition" });
    }

    competition = await Competition.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      competition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    if (
      competition.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this competition" });
    }

    await competition.deleteOne();

    res.json({
      success: true,
      message: "Competition deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
