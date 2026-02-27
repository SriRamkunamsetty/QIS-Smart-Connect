import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Performance Risk Prediction
 * Triggered automatically when a student doc is updated.
 */
export const calculateRiskScore = onDocumentUpdated("students/{studentId}", async (event) => {
    const newValue = event.data.after.data();
    const oldValue = event.data.before.data();

    // Prevent infinite loops and only run if relevant data changed
    if (newValue.attendance === oldValue.attendance &&
        newValue.cgpa === oldValue.cgpa &&
        newValue.internalMarks === oldValue.internalMarks) {
        return null;
    }

    const attendance = newValue.attendance || 0;
    const cgpaPercent = (newValue.cgpa || 0) * 10;
    const internalMarksPercent = newValue.internalMarks || 0;

    // Formula: (0.4 * Attendance) + (0.3 * CGPA%) + (0.3 * InternalMarks%)
    const riskScore = (0.4 * attendance) + (0.3 * cgpaPercent) + (0.3 * internalMarksPercent);

    let riskLevel = "Safe";
    if (riskScore < 60) riskLevel = "High Risk";
    else if (riskScore < 75) riskLevel = "Moderate Risk";

    console.log(`Updating student ${event.params.studentId} with Risk Score: ${riskScore} (${riskLevel})`);

    return event.data.after.ref.update({
        riskScore: Math.round(riskScore),
        riskLevel: riskLevel
    });
});

/**
 * 2. Smart Placement Readiness Score
 * Callable function for students to get their latest score.
 */
export const getPlacementReadiness = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');

    const studentDoc = await db.collection('students').doc(uid).get();
    if (!studentDoc.exists) throw new HttpsError('not-found', 'Student profile not found.');

    const data = studentDoc.data();
    const resumeScore = data.resumeScore || 0;
    const cgpaPercent = (data.cgpa || 0) * 10;
    const skillsCount = (data.skills || []).length;
    const internshipCount = (data.internships || []).length;

    const skillScore = (skillsCount / 8) * 100;
    const internshipScore = Math.min((internshipCount / 3) * 100, 100);

    // Formula: (0.35 * ResumeScore) + (0.25 * CGPA%) + (0.25 * SkillScore) + (0.15 * InternshipScore)
    const placementScore = (0.35 * resumeScore) + (0.25 * cgpaPercent) + (0.25 * skillScore) + (0.15 * internshipScore);

    let level = "Needs Improvement";
    if (placementScore > 80) level = "Excellent";
    else if (placementScore > 60) level = "Good";

    const result = {
        score: Math.round(placementScore),
        level: level,
        lastCalculated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('students').doc(uid).update({ placementReadinessScore: result.score });

    return result;
});

/**
 * 3. Skill Gap Analyzer
 */
export const analyzeSkillGap = onCall(async (request) => {
    const uid = request.auth?.uid;
    const { companyName } = request.data;

    if (!uid || !companyName) throw new HttpsError('invalid-argument', 'Missing student UID or company name.');

    const [studentDoc, companyDoc] = await Promise.all([
        db.collection('students').doc(uid).get(),
        db.collection('companySkills').where('name', '==', companyName).limit(1).get()
    ]);

    if (!studentDoc.exists || companyDoc.empty) throw new HttpsError('not-found', 'Student or Company data missing.');

    const studentSkills = studentDoc.data().skills || [];
    const requiredSkills = companyDoc.docs[0].data().skills || [];

    const commonSkills = studentSkills.filter(s => requiredSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !studentSkills.includes(s));
    const matchPercent = (commonSkills.length / requiredSkills.length) * 100;

    return {
        matchPercentage: Math.round(matchPercent),
        missingSkills: missingSkills,
        commonSkills: commonSkills
    };
});

/**
 * 4. Auth: Set Custom Claims
 * Securely set user roles.
 */
export const setUserRole = onCall(async (request) => {
    if (!request.auth?.token.admin) {
        throw new HttpsError('permission-denied', 'Only admins can set user roles.');
    }

    const { targetUid, role, branch } = request.data;
    const claims = {
        admin: role === 'Admin',
        faculty: role === 'Faculty',
        student: role === 'Student',
        branch: branch
    };

    await admin.auth().setCustomUserClaims(targetUid, claims);
    await db.collection('users').doc(targetUid).update({ role, branch });

    return { success: true };
});

/**
 * 5. Digital ID Card Generator
 */
export const generateDigitalID = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Must be authenticated.');

    const studentDoc = await db.collection('students').doc(uid).get();
    if (!studentDoc.exists) throw new HttpsError('not-found', 'Student data not found.');

    const data = studentDoc.data();

    // Logic to generate QR code or unique identifier can reside here
    // For now returning the structured data for the frontend component to render
    return {
        name: data.name,
        rollNumber: data.rollNumber,
        branch: data.branch,
        validUntil: "2028-06-30",
        idHash: Buffer.from(`${uid}-${data.rollNumber}`).toString('base64'),
        photoUrl: data.photoUrl || null
    };
});
