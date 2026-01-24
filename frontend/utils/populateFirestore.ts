import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const populateFirestore = async () => {
  try {
    // Add metrics data
    await setDoc(doc(db, 'metrics', 'dashboard'), {
      totalCandidates: { value: 250, delta: '+12' },
      atsRejections: { value: 88, delta: '35%', trend: 'down' },
      rescuedCandidates: { value: 12, delta: '+5' },
      activeBiasAlerts: { value: 3, delta: '⚠️' },
      lastUpdated: new Date()
    });

    // Add alerts data
    const alertsRef = collection(db, 'alerts');
    await addDoc(alertsRef, {
      type: 'warning',
      title: '🟡 Bias Detected in Keyword Filters',
      description: '3 keyword(s) show rejection rate disparities exceeding 25% threshold.',
      affected: 'Candidates over 45 years old',
      recommendation: 'Review "KPI" and "OKR" filters to include semantic equivalents',
      timestamp: new Date(),
      active: true
    });

    await addDoc(alertsRef, {
      type: 'info',
      title: '🦸 Talent Rescue Opportunity',
      description: '12 high-potential candidates auto-rejected but have >85% semantic match.',
      affected: 'Primarily experienced professionals (45+) and female candidates',
      timestamp: new Date(),
      active: true
    });

    // Add rescued candidates data
    const candidatesRef = collection(db, 'rescued_candidates');
    const candidates = [
      { id: 1023, ageGroup: '>45', gender: 'Female', keywords: 'CRM Strategy', score: 92 },
      { id: 1847, ageGroup: '>45', gender: 'Male', keywords: 'KPI', score: 89 },
      { id: 2156, ageGroup: '30-45', gender: 'Female', keywords: 'Client Engagement', score: 87 }
    ];

    for (const candidate of candidates) {
      await addDoc(candidatesRef, {
        ...candidate,
        rescuedAt: new Date(),
        status: 'rescued'
      });
    }

    // Add analytics data
    await setDoc(doc(db, 'analytics', 'demographics'), {
      ageStats: {
        'Under 30': 22,
        '30-45': 30,
        'Over 45': 52
      },
      genderStats: {
        'Male': 28,
        'Female': 42,
        'Non-binary': 38
      },
      lastUpdated: new Date()
    });

    console.log('Firestore populated successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
};