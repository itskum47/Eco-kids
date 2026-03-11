const mongoose = require('mongoose');
const Experiment = require('../models/Experiment');
require('dotenv').config();

const API = 'http://localhost:5001/api';

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
};

let teacherToken, studentToken, studentId, experimentId, submissionId;

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n=== END-TO-END IMPACT TRIGGER TEST ===\n');

    // STEP 1: Get student ID and tokens
    console.log('STEP 1: Getting tokens...');
    const studentLogin = await fetchJSON(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@ecokids.com', password: 'password123' })
    });
    studentToken = studentLogin.token;
    studentId = studentLogin.user.id;
    console.log(`✓ Student authenticated (ID: ${studentId.substring(0, 8)}...)`);

    const teacherLogin = await fetchJSON(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@ecokids.com', password: 'password123' })
    });
    teacherToken = teacherLogin.token;
    console.log('✓ Teacher authenticated');

    // STEP 2: Get the experiment we created earlier
    console.log('\nSTEP 2: Finding waste-recycling experiment...');
    const experiment = await Experiment.findOne({ category: 'waste-recycling' }).sort({ createdAt: -1 });
    if (!experiment) {
      console.log('✗ No waste-recycling experiment found');
      process.exit(1);
    }
    experimentId = experiment._id.toString();
    console.log(`✓ Found experiment: ${experiment.title} (ID: ${experimentId.substring(0, 8)}...)`);

    // STEP 3: Student submits experiment
    console.log('\nSTEP 3: Student submitting experiment...');
    const existingSubmissionsResponse = await fetchJSON(
      `${API}/experiments/${experimentId}/submissions`,
      {
        headers: { Authorization: `Bearer ${teacherToken}` }
      }
    );
    const existingSubmission = existingSubmissionsResponse.data.submissions.find(sub => {
      const userId = sub.user && (sub.user._id || sub.user);
      return userId && userId.toString() === studentId;
    });

    if (existingSubmission) {
      submissionId = existingSubmission._id;
      console.log(`✓ Submission already exists (ID: ${submissionId.substring(0, 8)}...)`);
    } else {
      const submitResponse = await fetchJSON(
        `${API}/experiments/${experimentId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            observations: 'Successfully segregated waste into 5 categories: plastic, paper, metal, glass, and organic',
            results: 'Collected 15kg of waste and recycled 12kg',
            rating: 4
          })
        }
      );
      if (submitResponse && submitResponse.data && submitResponse.data._id) {
        submissionId = submitResponse.data._id;
      } else {
        const submissionsResponse = await fetchJSON(
          `${API}/experiments/${experimentId}/submissions`,
          {
            headers: { Authorization: `Bearer ${teacherToken}` }
          }
        );
        const submission = submissionsResponse.data.submissions.find(sub => {
          const userId = sub.user && (sub.user._id || sub.user);
          return userId && userId.toString() === studentId;
        });
        if (!submission) {
          throw new Error('Unable to locate submission after submit');
        }
        submissionId = submission._id;
      }
      console.log(`✓ Submission created (ID: ${submissionId.substring(0, 8)}...)`);
    }

    // STEP 4: Check impact BEFORE approval
    console.log('\nSTEP 4: Checking student impact BEFORE approval...');
    const beforeApproval = await fetchJSON(`${API}/impact/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const before = beforeApproval.data.environmentalImpact;
    console.log(`  Trees planted: ${before.treesPlanted}`);
    console.log(`  CO₂ prevented: ${before.co2Prevented}kg`);
    console.log(`  Water saved: ${before.waterSaved}L`);
    console.log(`  Activities completed: ${before.activitiesCompleted}`);

    // STEP 5: Teacher approves submission
    console.log('\nSTEP 5: Teacher approving submission...');
    const approveResponse = await fetchJSON(
      `${API}/experiments/${experimentId}/submissions/${submissionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        },
        body: JSON.stringify({ status: 'approved' })
      }
    );
    console.log(`✓ Submission approved`);

    // STEP 6: Check impact AFTER approval
    console.log('\nSTEP 6: Checking student impact AFTER approval...');
    const afterApproval = await fetchJSON(`${API}/impact/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const after = afterApproval.data.environmentalImpact;
    console.log(`  Trees planted: ${after.treesPlanted}`);
    console.log(`  CO₂ prevented: ${after.co2Prevented}kg`);
    console.log(`  Water saved: ${after.waterSaved}L`);
    console.log(`  Activities completed: ${after.activitiesCompleted}`);

    // STEP 7: Verify the trigger worked
    console.log('\n=== VERIFICATION ===');
    const impactTriggered = after.activitiesCompleted > before.activitiesCompleted;
    
    if (impactTriggered) {
      console.log('✅ IMPACT TRIGGERED SUCCESSFULLY');
      console.log(`   Activity count: ${before.activitiesCompleted} → ${after.activitiesCompleted}`);
      console.log(`   CO₂ prevented: ${before.co2Prevented}kg → ${after.co2Prevented}kg`);
      console.log('\n✅ PHASE 1 VALIDATION: COMPLETE');
      console.log('   The approval workflow now triggers environmental impact updates.');
    } else {
      console.log('❌ IMPACT NOT TRIGGERED');
      console.log('   Approval did not update environmental metrics.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

test();
