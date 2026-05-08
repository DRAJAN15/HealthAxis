const Hospital = require("../models/Hospital");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

exports.getHospitalsPublic = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select("name about facilities contact")
      .sort({ name: 1 });

    const counts = await DoctorProfile.aggregate([
      { $group: { _id: "$hospital", doctorCount: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id, c.doctorCount]));

    const data = hospitals.map((h) => ({
      ...h.toObject(),
      doctorCount: countMap.get(h.name) || 0,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

exports.getHospitalPublic = async (req, res, next) => {
  try {
    const decodedName = decodeURIComponent(req.params.name || "").trim();
    const hospital = await Hospital.findOne({
      name: {
        $regex: new RegExp(
          `^${decodedName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
      isActive: true,
    }).select("name about facilities contact");

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "Hospital not found" });
    }

    const profiles = await DoctorProfile.find({ hospital: hospital.name });
    const doctorIds = profiles.map((p) => p.user);
    const doctors = await User.find({
      _id: { $in: doctorIds },
      role: "doctor",
      isActive: true,
    }).select("-password");

    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));
    const doctorData = doctors.map((doc) => ({
      ...doc.toObject(),
      profile: profileMap.get(doc._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      data: {
        hospital,
        doctors: doctorData,
      },
    });
  } catch (error) {
    next(error);
  }
};
