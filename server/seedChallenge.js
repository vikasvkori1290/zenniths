require('dotenv').config();
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'vikas@clubhub.com' });
    if (!user) { console.log('User not found'); process.exit(1); }

    await Challenge.deleteMany({});
    
    await Challenge.create({
      title: 'Two Sum II - Input Array Is Sorted',
      difficulty: 'Medium',
      category: 'Algorithm',
      points: 50,
      createdBy: user._id,
      description: `
Given a **1-indexed** array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number. Let these two numbers be \`numbers[index1]\` and \`numbers[index2]\` where \`1 <= index1 < index2 <= numbers.length\`.

Return the indices of the two numbers, \`index1\` and \`index2\`, added by one as an integer array \`[index1, index2]\` of length 2.

The tests are generated such that there is **exactly one solution**. You **may not** use the same element twice.

Your solution must use only constant extra space.

### Example 1:
\`\`\`javascript
Input: numbers = [2,7,11,15], target = 9
Output: [1,2]
Explanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].
\`\`\`

### Example 2:
\`\`\`python
Input: numbers = [-1,0], target = -1
Output: [1,2]
Explanation: The sum of -1 and 0 is -1. Therefore, index1 = 1, index2 = 2. We return [1, 2].
\`\`\`

---
**Submit your solution URL (GitHub/Gist) below when you are finished.**
      `
    });

    console.log('Challenge seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
