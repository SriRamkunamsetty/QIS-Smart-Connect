import admin from 'firebase-admin';
import fs from 'fs';

// Initialize with a service account or via environment
const serviceAccountPath = './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error("Please provide a serviceAccountKey.json file to run the seeding script.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedData = async () => {
    try {
        console.log("Starting Seeding...");

        // 1. Seed Admissions Collection
        const admissions = [
            {
                id: 'cse',
                branchName: 'Computer Science & Engineering',
                eligibilityRules: { minCGPA: 7.5, entranceCutoff: 150, requiredSubjects: ['Maths', 'Physics'] }
            },
            {
                id: 'ece',
                branchName: 'Electronics & Communication Engg.',
                eligibilityRules: { minCGPA: 7.0, entranceCutoff: 180, requiredSubjects: ['Maths', 'Physics'] }
            },
            {
                id: 'mech',
                branchName: 'Mechanical Engineering',
                eligibilityRules: { minCGPA: 6.5, entranceCutoff: 210, requiredSubjects: ['Maths', 'Physics'] }
            },
            {
                id: 'civil',
                branchName: 'Civil Engineering',
                eligibilityRules: { minCGPA: 6.0, entranceCutoff: 250, requiredSubjects: ['Maths', 'Physics'] }
            }
        ];

        for (const branch of admissions) {
            await db.collection('admissions').doc(branch.id).set(branch);
            console.log(`Seeded admission rules for: ${branch.id}`);
        }

        // 2. Seed Settings Collection (Weather)
        await db.collection('settings').doc('weather').set({
            location: 'Ongole',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            data: {
                temp: 28,
                condition: 'Sunny',
                humidity: 65
            }
        });
        console.log("Seeded default weather settings for Ongole.");

        // 3. Seed Company Skills
        const companySkills = [
            { name: 'Google', skills: ['DSA', 'System Design', 'Python', 'DBMS'] },
            { name: 'Microsoft', skills: ['C#', 'Azure', 'DSA', 'SQL'] },
            { name: 'Amazon', skills: ['AWS', 'Java', 'Distributed Systems', 'NoSQL'] }
        ];

        for (const company of companySkills) {
            await db.collection('companySkills').add(company);
            console.log(`Seeded skills for: ${company.name}`);
        }

        console.log("Seeding Completed Successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
    }
};

/**
 * Utility to set custom claims for a user
 * @param {string} uid 
 * @param {object} claims { admin: true, faculty: true, branch: "CSE" }
 */
const setCustomClaims = async (uid, claims) => {
    try {
        await admin.auth().setCustomUserClaims(uid, claims);
        console.log(`Custom claims set for user ${uid}:`, claims);
    } catch (error) {
        console.error("Error setting custom claims:", error);
    }
};

// Execute seeding
seedData();

// Example usage for setting claims (commented out)
// setCustomClaims('TARGET_USER_UID', { admin: true, branch: 'CSE' });
