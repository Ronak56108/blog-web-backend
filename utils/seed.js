import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';

dotenv.config({ path: '../../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform');
    console.log('MongoDB Connected to seed large dataset');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Realistic mock data dictionaries
const blogData = {
  Technology: [
    "The Future of AI in Daily Life", "Quantum Computing Simplified", "Web3 and the New Era of Internet", 
    "How 5G is Transforming Connectivity", "Cybersecurity Threats in 2026", "A Deep Dive into React 19", 
    "Automating DevOps using Python", "The Evolution of Internet of Things (IoT)", "Rise of Autonomous Vehicles", 
    "Navigating Cloud Native Architectures", "Machine Learning at Scale", "Building Data Science Pipelines", 
    "Edge Computing Explained", "Augmented Reality Beyond Gaming", "Green Technology Innovations"
  ],
  Startup: [
    "Building an MVP That Users Love", "Why Bootstrapping Beats VC Funding", "Finding Product-Market Fit", 
    "Scaling Your First 100 Customers", "The Psychology behind Pricing Models", "Pitching to Angel Investors", 
    "Hiring Your Founding Team", "Lean Startup Principles Explained", "Fail Fast: What It Actually Means", 
    "B2B vs B2C: Different Playbooks", "SaaS Metrics You Must Track", "The Art of the Pivot", 
    "Navigating Co-founder Conflicts", "Growth Hacking on a Shoestring Budget", "Exit Strategies for Founders"
  ],
  Lifestyle: [
    "Finding Balance in a Remote World", "Minimalism as a Productivity Tool", "The Art of Slow Living", 
    "Modern Nomading: Working from Anywhere", "Designing a Clutter-Free Workspace", "The Power of Digital Detox", 
    "Building Healthy Morning Routines", "Why Hobbies outside Work Matter", "Curating Your Reading List", 
    "The Philosophy of Sleep Hygiene", "Traveling Intentionally", "Mindfulness for Busy Techies", 
    "Revamping Your Wardrobe Sustainably", "Nutritional Basics for Desk Workers", "Rediscovering Analog Activities"
  ],
  Finance: [
    "Stock Market Basics for Beginners", "Index Funds vs Mutual Funds", "Understanding Cryptocurrency Cycles", 
    "How Inflation Affects Your Savings", "Real Estate Investing 101", "The FIRE Movement Explained", 
    "Budgeting Strategies That Actually Work", "Building an Emergency Fund", "Tax Optimization for Freelancers", 
    "Navigating Bear Markets Calmly", "The Psychology of Money", "Creating Passive Income Streams", 
    "Debt Snowball vs Avalanche Method", "Diversifying Your Portfolio", "Angel Investing Basics"
  ]
};

const imageKeywords = {
  Technology: 'technology,laptop,code',
  Startup: 'startup,meeting,office',
  Lifestyle: 'coffee,desk,lifestyle',
  Finance: 'money,chart,finance'
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear Existing Data safely
    await User.deleteMany();
    await Post.deleteMany();

    // Create Base Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const creators = await User.insertMany([
      { name: 'Admin User', email: 'admin@blogspace.com', password: hashedPassword, role: 'admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
      { name: 'Jane Doe', email: 'jane@example.com', password: hashedPassword, role: 'user', avatar: 'https://i.pravatar.cc/150?u=jane' }
    ]);
    
    console.log('Users created:', creators.length);

    let allPosts = [];

    // Loop exactly 15 times for each category array
    for (const [category, titles] of Object.entries(blogData)) {
      titles.forEach((title, i) => {
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
        
        // Random assign author
        const authorId = creators[i % 2 === 0 ? 0 : 1]._id;
        
        // Generate random past date within last 6 months
        const createdDate = generateRandomDate(new Date(2025, 9, 1), new Date());

        allPosts.push({
          title,
          slug,
          content: `
            <p>Welcome to our comprehensive guide on <b>${title}</b>. This topic falls broadly within the ${category} landscape and is crucial for modern professionals.</p>
            <h2>The Current Landscape</h2>
            <p>As we navigate complex topics, breaking them down into fundamental pillars is key. Research has shown that maintaining a robust understanding is essential for scalable success.</p>
            <figure>
              <img src="https://picsum.photos/seed/inline-${category}-${i}/600/400" alt="Related context image" style="border-radius: 12px; margin: 24px 0; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
              <figcaption style="text-align: center; color: #6b7280; font-size: 0.875rem;">A visual representation of related fundamental concepts.</figcaption>
            </figure>
            <h2>Future Implications</h2>
            <p>Industry leaders are constantly adapting to these changes. What does this mean for the future? We must remain agile, continuing to iterate on proven frameworks while exploring adjacent paradigms.</p>
            <p>Thank you for exploring this idea with us. Keep an eye out for our upcoming deep dives in similar domains.</p>
          `,
          coverImage: `https://picsum.photos/seed/${category}-${i}/800/500`, // Guaranteed working random image
          author: authorId,
          category,
          status: 'published',
          createdAt: createdDate,
          updatedAt: createdDate
        });
      });
    }

    await Post.insertMany(allPosts);
    console.log(`Successfully seeded ${allPosts.length} rich blog posts (15 in each category).`);
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
