const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PatientProfile = require("../models/PatientProfile");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Hospital = require("../models/Hospital");
const MedicalRecord = require("../models/MedicalRecord");

const resetCollection = async (model) => {
  try {
    await model.collection.drop();
  } catch (err) {
    if (err.codeName !== "NamespaceNotFound") {
      throw err;
    }
  }
};

const addDaysAtTime = (daysFromToday, hours, minutes = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Reset collections so stale indexes from old schemas do not break seeding.
  await resetCollection(MedicalRecord);
  await resetCollection(Payment);
  await resetCollection(Appointment);
  await resetCollection(Hospital);
  await resetCollection(User);
  await resetCollection(DoctorProfile);
  await resetCollection(PatientProfile);

  // Super admin and hospital admin
  const superAdmin = await User.create({
    name: "Super Admin",
    email: "superadmin@hospital.com",
    password: "SuperAdmin@123",
    role: "super_admin",
    phone: "+919000000001",
  });

  const hospitalAdmin = await User.create({
    name: "Hospital Admin",
    email: "hospitaladmin@hospital.com",
    password: "HospitalAdmin@123",
    role: "hospital_admin",
    hospital: "City General Hospital",
    phone: "+919000000002",
  });

  const hospitalAdmin2 = await User.create({
    name: "Metro Hospital Admin",
    email: "metroadmin@hospital.com",
    password: "HospitalAdmin@123",
    role: "hospital_admin",
    hospital: "MetroCare Hospital",
    phone: "+919000000003",
  });

  const hospitalAdmin3 = await User.create({
    name: "Sunrise Hospital Admin",
    email: "sunriseadmin@hospital.com",
    password: "HospitalAdmin@123",
    role: "hospital_admin",
    hospital: "Sunrise Multispeciality",
    phone: "+919000000004",
  });

  // Legacy admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@hospital.com",
    password: "Admin@123",
    role: "admin",
    phone: "+919000000000",
  });

  // Doctors
  const doctorsData = [
    {
      name: "Dr. Arjun Sharma",
      email: "arjun@hospital.com",
      specialization: "Cardiology",
      qualification: "MBBS, MD (Cardiology)",
      experience: 12,
      consultationFee: 800,
      hospital: "City General Hospital",
    },
    {
      name: "Dr. Priya Mehta",
      email: "priya@hospital.com",
      specialization: "Neurology",
      qualification: "MBBS, DM (Neurology)",
      experience: 9,
      consultationFee: 900,
      hospital: "MetroCare Hospital",
    },
    {
      name: "Dr. Rahul Gupta",
      email: "rahul@hospital.com",
      specialization: "Orthopedics",
      qualification: "MBBS, MS (Ortho)",
      experience: 15,
      consultationFee: 700,
      hospital: "Sunrise Multispeciality",
    },
    {
      name: "Dr. Sneha Kapoor",
      email: "sneha@hospital.com",
      specialization: "Dermatology",
      qualification: "MBBS, MD (Derma)",
      experience: 7,
      consultationFee: 600,
      hospital: "Northview Medical Center",
    },
    {
      name: "Dr. Vikram Singh",
      email: "vikram@hospital.com",
      specialization: "Pediatrics",
      qualification: "MBBS, MD (Pediatrics)",
      experience: 10,
      consultationFee: 500,
      hospital: "Green Valley Hospital",
    },
    {
      name: "Dr. Neha Iyer",
      email: "neha.iyer@hospital.com",
      specialization: "General Medicine",
      qualification: "MBBS, MD (Internal Medicine)",
      experience: 11,
      consultationFee: 650,
      hospital: "City General Hospital",
    },
    {
      name: "Dr. Amit Rao",
      email: "amit.rao@hospital.com",
      specialization: "ENT",
      qualification: "MBBS, MS (ENT)",
      experience: 8,
      consultationFee: 550,
      hospital: "MetroCare Hospital",
    },
    {
      name: "Dr. Kavya Nair",
      email: "kavya.nair@hospital.com",
      specialization: "Ophthalmology",
      qualification: "MBBS, MS (Ophthalmology)",
      experience: 13,
      consultationFee: 750,
      hospital: "Northview Medical Center",
    },
    {
      name: "Dr. Rohan Bhat",
      email: "rohan.bhat@hospital.com",
      specialization: "Psychiatry",
      qualification: "MBBS, MD (Psychiatry)",
      experience: 6,
      consultationFee: 700,
      hospital: "Sunrise Multispeciality",
    },
    {
      name: "Dr. Meera Joshi",
      email: "meera.joshi@hospital.com",
      specialization: "Cardiology",
      qualification: "MBBS, DM (Cardiology)",
      experience: 14,
      consultationFee: 950,
      hospital: "Green Valley Hospital",
    },
    {
      name: "Dr. Tushar Kulkarni",
      email: "tushar.kulkarni@hospital.com",
      specialization: "Orthopedics",
      qualification: "MBBS, DNB (Orthopedics)",
      experience: 9,
      consultationFee: 680,
      hospital: "City General Hospital",
    },
    {
      name: "Dr. Alisha Fernandes",
      email: "alisha.fernandes@hospital.com",
      specialization: "Dermatology",
      qualification: "MBBS, DVD",
      experience: 5,
      consultationFee: 520,
      hospital: "MetroCare Hospital",
    },
  ];

  const availability = [
    { day: "Monday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
    {
      day: "Wednesday",
      startTime: "09:00",
      endTime: "13:00",
      slotDuration: 30,
    },
    { day: "Thursday", startTime: "14:00", endTime: "18:00", slotDuration: 30 },
    { day: "Friday", startTime: "09:00", endTime: "17:00", slotDuration: 30 },
  ];

  const hospitalCatalog = {
    "City General Hospital": {
      about:
        "City General Hospital is a multi-specialty tertiary care center known for emergency response, cardiology, and trauma care.",
      facilities: [
        "24/7 Emergency",
        "ICU",
        "Cardiac Lab",
        "MRI/CT Scan",
        "In-house Pharmacy",
      ],
      contact: {
        phone: "+91 11 4000 1001",
        email: "contact@citygeneral.example",
        address: "21 Central Avenue",
        city: "New Delhi",
        state: "Delhi",
      },
    },
    "MetroCare Hospital": {
      about:
        "MetroCare Hospital focuses on neurology, ENT, and minimally invasive treatments with modern diagnostics.",
      facilities: [
        "Neuro Diagnostics",
        "ENT Surgery Wing",
        "Day Care",
        "Digital Records",
        "Ambulance",
      ],
      contact: {
        phone: "+91 22 4500 2200",
        email: "hello@metrocare.example",
        address: "77 Ring Road",
        city: "Mumbai",
        state: "Maharashtra",
      },
    },
    "Sunrise Multispeciality": {
      about:
        "Sunrise Multispeciality provides orthopedic, psychiatric, and preventive care through patient-centric programs.",
      facilities: [
        "Orthopedic OT",
        "Mental Health Unit",
        "Physiotherapy",
        "Lab Services",
        "Cafeteria",
      ],
      contact: {
        phone: "+91 20 5100 3300",
        email: "support@sunrise.example",
        address: "9 Health Boulevard",
        city: "Pune",
        state: "Maharashtra",
      },
    },
    "Northview Medical Center": {
      about:
        "Northview Medical Center specializes in dermatology and ophthalmology with advanced outpatient services.",
      facilities: [
        "Skin Clinic",
        "Vision Center",
        "Laser Unit",
        "Pathology",
        "Teleconsult",
      ],
      contact: {
        phone: "+91 80 4300 4400",
        email: "care@northview.example",
        address: "44 Lake Side",
        city: "Bengaluru",
        state: "Karnataka",
      },
    },
    "Green Valley Hospital": {
      about:
        "Green Valley Hospital delivers pediatric and cardiac follow-up care in a family-friendly healing environment.",
      facilities: [
        "Pediatrics Ward",
        "Cardio OPD",
        "Vaccination Clinic",
        "NICU",
        "Diagnostic Imaging",
      ],
      contact: {
        phone: "+91 40 4200 5500",
        email: "info@greenvalley.example",
        address: "102 Green Valley Road",
        city: "Hyderabad",
        state: "Telangana",
      },
    },
  };

  const hospitalNames = [...new Set(doctorsData.map((d) => d.hospital))];
  await Hospital.insertMany(
    hospitalNames.map((name) => ({
      name,
      ...(hospitalCatalog[name] || {
        about: "Trusted multi-specialty care center.",
        facilities: ["OPD", "Lab", "Pharmacy"],
        contact: {
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
        },
      }),
    })),
  );

  const doctorUsers = [];

  for (const d of doctorsData) {
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: "Doctor@123",
      role: "doctor",
      phone: "+919111111111",
    });
    const profile = await DoctorProfile.create({
      user: user._id,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      consultationFee: d.consultationFee,
      availability,
      bio: `Experienced ${d.specialization} specialist.`,
      hospital: d.hospital,
    });

    doctorUsers.push({
      _id: user._id,
      email: user.email,
      name: user.name,
      hospital: profile.hospital,
      fee: profile.consultationFee,
    });
  }

  // Patients
  const patientsData = [
    { name: "Ravi Kumar", email: "ravi@example.com", phone: "+919222222222" },
    {
      name: "Anjali Verma",
      email: "anjali@example.com",
      phone: "+919333333333",
    },
    { name: "Mohit Jain", email: "mohit@example.com", phone: "+919444444444" },
    { name: "Pooja Singh", email: "pooja@example.com", phone: "+919555555555" },
    {
      name: "Karan Malhotra",
      email: "karan@example.com",
      phone: "+919666666666",
    },
    { name: "Nisha Patel", email: "nisha@example.com", phone: "+919777777777" },
    { name: "Sahil Arora", email: "sahil@example.com", phone: "+919888888888" },
    { name: "Isha Roy", email: "isha@example.com", phone: "+919999999999" },
  ];

  const patientUsers = [];
  const genders = [
    "male",
    "female",
    "male",
    "female",
    "male",
    "female",
    "male",
    "female",
  ];
  const bloodGroups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

  for (let i = 0; i < patientsData.length; i += 1) {
    const p = patientsData[i];
    const user = await User.create({
      ...p,
      password: "Patient@123",
      role: "patient",
    });
    await PatientProfile.create({
      user: user._id,
      gender: genders[i] || "male",
      bloodGroup: bloodGroups[i] || "O+",
    });

    patientUsers.push({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
  }

  const doctorByEmail = Object.fromEntries(
    doctorUsers.map((d) => [d.email, d]),
  );
  const patientByEmail = Object.fromEntries(
    patientUsers.map((p) => [p.email, p]),
  );

  const appointmentSeeds = [
    {
      doctor: "arjun@hospital.com",
      patient: "ravi@example.com",
      days: -8,
      hour: 10,
      minute: 0,
      status: "completed",
      type: "in-person",
      reason: "Follow-up for chest discomfort",
      paymentStatus: "paid",
    },
    {
      doctor: "neha.iyer@hospital.com",
      patient: "anjali@example.com",
      days: -3,
      hour: 11,
      minute: 30,
      status: "completed",
      type: "video",
      reason: "Persistent fever and fatigue",
      paymentStatus: "paid",
    },
    {
      doctor: "tushar.kulkarni@hospital.com",
      patient: "mohit@example.com",
      days: 2,
      hour: 9,
      minute: 30,
      status: "confirmed",
      type: "in-person",
      reason: "Knee pain after sports injury",
      paymentStatus: "created",
    },

    {
      doctor: "priya@hospital.com",
      patient: "pooja@example.com",
      days: -6,
      hour: 12,
      minute: 0,
      status: "completed",
      type: "in-person",
      reason: "Migraine and dizziness review",
      paymentStatus: "paid",
    },
    {
      doctor: "amit.rao@hospital.com",
      patient: "karan@example.com",
      days: -1,
      hour: 15,
      minute: 0,
      status: "confirmed",
      type: "phone",
      reason: "Sinus congestion and ear pain",
      paymentStatus: "created",
    },
    {
      doctor: "alisha.fernandes@hospital.com",
      patient: "nisha@example.com",
      days: 4,
      hour: 16,
      minute: 0,
      status: "pending",
      type: "video",
      reason: "Skin allergy consultation",
      paymentStatus: "created",
    },

    {
      doctor: "rahul@hospital.com",
      patient: "sahil@example.com",
      days: -10,
      hour: 10,
      minute: 30,
      status: "completed",
      type: "in-person",
      reason: "Lower back pain treatment",
      paymentStatus: "paid",
    },
    {
      doctor: "rohan.bhat@hospital.com",
      patient: "isha@example.com",
      days: -2,
      hour: 14,
      minute: 0,
      status: "confirmed",
      type: "video",
      reason: "Stress and sleep disorder consultation",
      paymentStatus: "created",
    },
    {
      doctor: "rahul@hospital.com",
      patient: "ravi@example.com",
      days: 6,
      hour: 11,
      minute: 0,
      status: "pending",
      type: "in-person",
      reason: "Shoulder mobility follow-up",
      paymentStatus: "created",
    },

    {
      doctor: "kavya.nair@hospital.com",
      patient: "anjali@example.com",
      days: -4,
      hour: 9,
      minute: 30,
      status: "completed",
      type: "in-person",
      reason: "Vision check and eye strain",
      paymentStatus: "paid",
    },
    {
      doctor: "meera.joshi@hospital.com",
      patient: "mohit@example.com",
      days: -7,
      hour: 13,
      minute: 0,
      status: "completed",
      type: "in-person",
      reason: "Routine cardiac screening",
      paymentStatus: "paid",
    },
    {
      doctor: "vikram@hospital.com",
      patient: "pooja@example.com",
      days: 3,
      hour: 10,
      minute: 0,
      status: "confirmed",
      type: "in-person",
      reason: "Pediatric vaccination follow-up",
      paymentStatus: "created",
    },

    {
      doctor: "sneha@hospital.com",
      patient: "karan@example.com",
      days: 5,
      hour: 12,
      minute: 30,
      status: "pending",
      type: "video",
      reason: "Dermatitis medication review",
      paymentStatus: "created",
    },
  ];

  let orderCounter = 1;
  let medicalRecordsCreated = 0;
  for (const seedItem of appointmentSeeds) {
    const doctor = doctorByEmail[seedItem.doctor];
    const patient = patientByEmail[seedItem.patient];
    if (!doctor || !patient) continue;

    const startHour = seedItem.hour;
    const startMinute = seedItem.minute || 0;
    const endDate = new Date(
      addDaysAtTime(seedItem.days, startHour, startMinute),
    );
    endDate.setMinutes(endDate.getMinutes() + 30);

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: addDaysAtTime(seedItem.days, startHour, startMinute),
      timeSlot: {
        startTime: `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
        endTime: `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`,
      },
      status: seedItem.status,
      type: seedItem.type,
      reason: seedItem.reason,
      consultationFee: doctor.fee,
      isPaid: seedItem.paymentStatus === "paid",
    });

    const payment = await Payment.create({
      appointment: appointment._id,
      patient: patient._id,
      doctor: doctor._id,
      amount: doctor.fee,
      currency: "INR",
      razorpayOrderId: `order_seed_${String(orderCounter).padStart(4, "0")}`,
      razorpayPaymentId:
        seedItem.paymentStatus === "paid"
          ? `pay_seed_${String(orderCounter).padStart(4, "0")}`
          : "",
      razorpaySignature:
        seedItem.paymentStatus === "paid"
          ? `sig_seed_${String(orderCounter).padStart(4, "0")}`
          : "",
      status: seedItem.paymentStatus,
      paymentMethod: seedItem.paymentStatus === "paid" ? "upi" : "",
      paidAt:
        seedItem.paymentStatus === "paid"
          ? addDaysAtTime(seedItem.days, startHour, startMinute)
          : undefined,
      receipt: `rcpt_seed_${String(orderCounter).padStart(4, "0")}`,
      notes: `${doctor.hospital} seeded appointment payment`,
    });

    appointment.payment = payment._id;
    await appointment.save();

    if (seedItem.status === "completed") {
      const diagnosis = seedItem.reason.toLowerCase().includes("card")
        ? "Mild cardiovascular risk profile"
        : seedItem.reason.toLowerCase().includes("pain")
          ? "Musculoskeletal inflammation"
          : seedItem.reason.toLowerCase().includes("skin")
            ? "Atopic dermatitis"
            : seedItem.reason.toLowerCase().includes("vision")
              ? "Digital eye strain"
              : "General clinical review";

      await MedicalRecord.create({
        patient: patient._id,
        doctor: doctor._id,
        appointment: appointment._id,
        diagnosis,
        symptoms: [seedItem.reason],
        prescriptions: [
          {
            medicine: "Paracetamol",
            dosage: "500 mg",
            frequency: "Twice daily",
            duration: "5 days",
            notes: "After meals",
          },
        ],
        labTests: [
          {
            testName: "CBC",
            result: "Within normal limits",
            normalRange: "4.5-11.0 x10^9/L",
            date: addDaysAtTime(seedItem.days + 1, 10, 0),
          },
        ],
        vitals: {
          bloodPressure: "120/80",
          heartRate: 76,
          temperature: 98.4,
          weight: 68,
          oxygenSaturation: 98,
        },
        notes: `Consultation completed for ${seedItem.reason.toLowerCase()}. Patient advised lifestyle and medication compliance.`,
        followUpDate: addDaysAtTime(seedItem.days + 14, 10, 0),
      });

      medicalRecordsCreated += 1;
    }

    orderCounter += 1;
  }

  console.log("✅ Database seeded!");
  console.log(`🏥 Hospitals seeded: ${hospitalNames.length}`);
  console.log(`🩺 Doctors seeded: ${doctorUsers.length}`);
  console.log(`🧑‍🤝‍🧑 Patients seeded: ${patientUsers.length}`);
  console.log(`📅 Appointments seeded: ${appointmentSeeds.length}`);
  console.log(`📁 Medical records seeded: ${medicalRecordsCreated}`);
  console.log("\n🔑 Credentials:");
  console.log("Super Admin:   superadmin@hospital.com   / SuperAdmin@123");
  console.log("Hospital Admin: hospitaladmin@hospital.com / HospitalAdmin@123");
  console.log("Metro Admin: metroadmin@hospital.com / HospitalAdmin@123");
  console.log("Sunrise Admin: sunriseadmin@hospital.com / HospitalAdmin@123");
  console.log("Admin:   admin@hospital.com   / Admin@123");
  console.log("Doctor:  arjun@hospital.com   / Doctor@123");
  console.log("Patient: ravi@example.com     / Patient@123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
