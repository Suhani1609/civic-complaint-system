import Ward from '../models/Ward.js';

const wards = [
  { wardNumber: 1,  wardName: 'Alkapuri',        city: 'Vadodara' },
  { wardNumber: 2,  wardName: 'Manjalpur',        city: 'Vadodara' },
  { wardNumber: 3,  wardName: 'Waghodia Road',    city: 'Vadodara' },
  { wardNumber: 4,  wardName: 'Fatehgunj',        city: 'Vadodara' },
  { wardNumber: 5,  wardName: 'Sayajigunj',       city: 'Vadodara' },
  { wardNumber: 6,  wardName: 'Gotri',            city: 'Vadodara' },
  { wardNumber: 7,  wardName: 'Harni',            city: 'Vadodara' },
  { wardNumber: 8,  wardName: 'Sama',             city: 'Vadodara' },
  { wardNumber: 9,  wardName: 'Gorwa',            city: 'Vadodara' },
  { wardNumber: 10, wardName: 'Pratapnagar',      city: 'Vadodara' },
  { wardNumber: 11, wardName: 'Nizampura',        city: 'Vadodara' },
  { wardNumber: 12, wardName: 'Karelibaug',       city: 'Vadodara' },
  { wardNumber: 13, wardName: 'Akota',            city: 'Vadodara' },
  { wardNumber: 14, wardName: 'Vasna',            city: 'Vadodara' },
  { wardNumber: 15, wardName: 'Tarsali',          city: 'Vadodara' },
  { wardNumber: 16, wardName: 'Panigate',         city: 'Vadodara' },
  { wardNumber: 17, wardName: 'Raopura',          city: 'Vadodara' },
  { wardNumber: 18, wardName: 'Wadi',             city: 'Vadodara' },
  { wardNumber: 19, wardName: 'Chhani',           city: 'Vadodara' },
  { wardNumber: 20, wardName: 'Makarpura',        city: 'Vadodara' },
];

export const seedWards = async () => {
  try {
    const count = await Ward.countDocuments();
    if (count > 0) {
      console.log(`✓ Wards already seeded (${count} wards)`);
      return;
    }
    await Ward.insertMany(wards);
    console.log(`✓ Seeded ${wards.length} wards successfully`);
  } catch (err) {
    console.error('Ward seeding failed:', err.message);
  }
};