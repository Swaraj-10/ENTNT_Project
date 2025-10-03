import { createServer, Model } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  let server = createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
    },

    seeds(server) {
      // --- 25 JOBS ---
      const jobTitles = [
        "Frontend Developer",
        "Backend Developer",
        "Fullstack Engineer",
        "Data Analyst",
        "Data Scientist",
        "DevOps Engineer",
        "UI/UX Designer",
        "Product Manager",
        "QA Engineer",
        "Mobile Developer",
        "AI Engineer",
        "Cloud Architect",
        "Database Admin",
        "System Analyst",
        "Business Analyst",
        "HR Specialist",
        "Marketing Manager",
        "SEO Specialist",
        "Support Engineer",
        "Network Engineer",
        "Security Specialist",
        "Embedded Engineer",
        "Game Developer",
        "Project Coordinator",
        "Technical Writer",
      ];

      jobTitles.forEach((title, index) => {
        server.create("job", {
          id: index + 1,
          title,
          slug: title.toLowerCase().replace(/\s+/g, "-"),
          status: index % 2 === 0 ? "active" : "archived",
        });
      });

      // --- CANDIDATES (Realistic Data) ---
      const firstNames = [
        "Rohit", "Anita", "Rahul", "Priya", "Suresh", "Neha",
        "Vikram", "Simran", "Arjun", "Pooja", "Amit", "Sneha",
        "Karan", "Divya", "Sanjay", "Meena", "Nikhil", "Anjali",
        "Manoj", "Kavita", "Ali", "Fatima", "John", "Sophia",
        "Michael", "Emma", "David", "Olivia", "James", "Isabella"
      ];
      const lastNames = [
        "Sharma", "Verma", "Khanna", "Gupta", "Reddy", "Iyer",
        "Khan", "Patel", "Singh", "Chopra", "Mehta", "Bansal",
        "Kapoor", "Nair", "Das", "Roy", "Mukherjee", "Saxena",
        "Yadav", "Pawar", "Smith", "Johnson", "Williams", "Brown",
        "Taylor", "Davis", "Miller", "Wilson", "Moore", "Anderson"
      ];
      const stages = ["applied", "screening", "interview", "offer", "rejected"];

      for (let i = 1; i <= 1000; i++) {
        const firstName =
          firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
          lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

        const jobId = Math.floor(Math.random() * 25) + 1;
        const stage = stages[Math.floor(Math.random() * stages.length)];

        server.create("candidate", {
          id: i,
          name: fullName,
          email,
          jobId,
          stage,
          timeline: [
            { stage: "applied", date: "2025-09-01" },
            { stage, date: "2025-09-10" },
          ],
        });
      }

      // --- ASSESSMENTS ---
      const assessments = [
        {
          id: 1,
          title: "React Fundamentals",
          description: "Test on basic React concepts",
          status: "active",
          questions: [
            "What is JSX?",
            "What are React hooks?",
            "Difference between state and props?",
            "Explain useEffect.",
            "What is Virtual DOM?",
            "What is reconciliation?",
            "Explain controlled vs uncontrolled components.",
            "What is Context API?",
            "What is React Router?",
            "What is Redux?",
          ],
        },
        {
          id: 2,
          title: "SQL Challenge",
          description: "Database & SQL skills test",
          status: "active",
          questions: [
            "What is a primary key?",
            "Difference between SQL and NoSQL?",
            "Explain JOINs in SQL.",
            "What is normalization?",
            "Difference between WHERE and HAVING?",
            "What is an index?",
            "Explain GROUP BY.",
            "What is ACID property?",
            "What is a stored procedure?",
            "Explain transactions in SQL.",
          ],
        },
        {
          id: 3,
          title: "JavaScript Essentials",
          description: "Core JavaScript skills test",
          status: "archived",
          questions: [
            "What is closure?",
            "Difference between let, var, const?",
            "What is hoisting?",
            "Explain event bubbling.",
            "What are promises?",
            "What is async/await?",
            "Difference between == and ===?",
            "What are arrow functions?",
            "What is prototype chain?",
            "Explain call, apply, bind.",
          ],
        },
      ];

      assessments.forEach((a) => server.create("assessment", a));
    },

    routes() {
      this.namespace = "api";

      // JOB ROUTES
      this.get("/jobs", (schema) => schema.jobs.all());
      this.get("/jobs/:id", (schema, request) =>
        schema.jobs.find(request.params.id)
      );
      this.post("/jobs", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });
      this.patch("/jobs/:id", (schema, request) => {
        let newAttrs = JSON.parse(request.requestBody);
        let job = schema.jobs.find(request.params.id);
        return job.update(newAttrs);
      });
      this.del("/jobs/:id");

      // CANDIDATE ROUTES
      this.get("/candidates", (schema) => schema.candidates.all());
      this.get("/candidates/:id", (schema, request) =>
        schema.candidates.find(request.params.id)
      );
      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });
      this.patch("/candidates/:id", (schema, request) => {
        let newAttrs = JSON.parse(request.requestBody);
        let candidate = schema.candidates.find(request.params.id);
        return candidate.update(newAttrs);
      });

      // ASSESSMENT ROUTES
      this.get("/assessments", (schema) => schema.assessments.all());
      this.get("/assessments/:id", (schema, request) =>
        schema.assessments.find(request.params.id)
      );
      this.post("/assessments", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.assessments.create(attrs);
      });
      this.patch("/assessments/:id", (schema, request) => {
        let newAttrs = JSON.parse(request.requestBody);
        let assessment = schema.assessments.find(request.params.id);
        return assessment.update(newAttrs);
      });
    },
  });

  return server;
}
