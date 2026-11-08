// All site content lives here. Edit this file to add a project or change a text;
// main.js only renders it.

window.SITE = {
  name: "Siddhant Chindhe",
  email: "siddhant.chindhe.de@gmail.com",
  linkedin: "https://www.linkedin.com/in/siddhant-chindhe/",
  github: "https://github.com/sidd-24",
  // the "skills in demand" panel also lists skills I haven't used in a project yet
  showGaps: true,
};

// Role filter above the projects. The first role is shown when the page opens.
window.TRACKS = [
  { id: "ai", label: "AI Engineering", market: "ML & AI",
    intro: "LLM applications that cite their sources, refuse when they don't know, and are tested in CI." },
  { id: "de", label: "Data Engineering", market: "data & analytics",
    intro: "Pipelines that run on a schedule and test their own data." },
  { id: "ml", label: "ML & Data Science", market: "ML & AI",
    intro: "Models that start from a simple baseline and are validated honestly." },
  { id: "bi", label: "Data & BI", market: "data & analytics",
    intro: "Reports that are reconciled to the source and easy to act on." },
  { id: "pm", label: "Product & Project", market: "product & project management",
    intro: "PRDs, business cases and status reports, with the numbers behind them." },
  { id: "qa", label: "QA & Testing", market: "software engineering",
    intro: "Automated tests for web apps and APIs." },
];

window.SKILL_GROUPS = [
  { name: "AI & LLMs", skills: ["LangChain", "LangGraph", "RAG", "MCP", "Hugging Face", "LLM evaluation", "Azure OpenAI", "Groq", "n8n"] },
  { name: "Data engineering", skills: ["SQL", "dbt", "DuckDB", "Airflow", "ETL / ELT", "Parquet", "Data quality tests", "GitHub Actions"] },
  { name: "Machine learning", skills: ["scikit-learn", "LightGBM", "XGBoost", "PyTorch", "MLflow", "SHAP", "Time series", "NLP"] },
  { name: "Analytics & BI", skills: ["Power BI", "DAX", "Excel", "PowerPoint", "pandas", "A/B testing", "Statistics"] },
  { name: "Product & project", skills: ["PRDs", "Business cases", "Jira", "Agile / Scrum", "Status reporting", "EU AI Act", "GDPR"] },
  { name: "Engineering & testing", skills: ["Python", "FastAPI", "Pydantic", "REST APIs", "pytest", "Playwright", "TypeScript", "Docker", "CI/CD"] },
];

// tracks: the roles a project is listed under (the first one is its main role).
// skills: the first four (other than Python and pytest) are shown on the card.
window.PROJECTS = [
  // AI engineering
  { slug: "it-service-desk-triage", title: "IT service desk triage", tracks: ["ai"], featured: true,
    what: "An LLM judges each ticket's category, impact and urgency; fixed rules set priority, team and SLA deadline.",
    headline: "0 of 16 urgent incidents under-prioritised, vs 12 for a keyword baseline",
    skills: ["Python", "FastAPI", "Pydantic", "Groq", "LLM evaluation", "pytest", "CI/CD"] },
  { slug: "policy-compliance-rag", title: "Policy compliance Q&A", tracks: ["ai"], featured: true,
    what: "Answers questions about company policies, GDPR, the AI Act and NIS2, citing document, page and section.",
    headline: "25/25 answers correct and cited; 8/8 out-of-scope questions refused",
    skills: ["Python", "RAG", "LangChain", "Hugging Face", "Groq", "LLM evaluation", "pytest", "GDPR", "EU AI Act"] },
  { slug: "resume-screener-eu-ai-act", title: "CV screener for the EU AI Act", tracks: ["ai", "pm"],
    what: "Ranks CVs against a job description but never decides, with anonymisation and an audit log.",
    headline: "Built for the AI Act's high-risk rules; 53 tests in CI",
    skills: ["Python", "LangChain", "FastAPI", "EU AI Act", "GDPR", "Pydantic", "Groq", "pytest", "CI/CD"] },
  { slug: "it-ops-compliance-assistant", title: "IT ops compliance agent", tracks: ["ai"],
    what: "LangGraph agent for IT operations and ISO 27001, using role-restricted MCP tools.",
    headline: "Ticket drafts need human approval; 43 tests in CI",
    skills: ["Python", "LangGraph", "MCP", "FastAPI", "LangChain", "Groq", "pytest", "CI/CD"] },
  { slug: "llm-agent", title: "Tool-calling agent", tracks: ["ai"],
    what: "Agent that chooses between web search, Wikipedia and a calculator to answer a question.",
    headline: "Copes when a tool fails",
    skills: ["Python", "LangChain", "Groq"] },
  { slug: "n8n-llm-automation", title: "Support request automation", tracks: ["ai"],
    what: "Low-code workflow: an LLM classifies and summarises support requests and routes urgent ones.",
    headline: "Runs in Docker, triggered by a webhook",
    skills: ["n8n", "Docker", "REST APIs"] },

  // Data engineering
  { slug: "db-delay-tracker", title: "Deutsche Bahn delay tracker", tracks: ["de", "bi"], featured: true, live: true,
    what: "Train punctuality pipeline for Nürnberg, Fürth, Erlangen and Bamberg with DuckDB and dbt.",
    headline: "1.57 million train stops, 20 dbt data tests, refreshed monthly",
    skills: ["Python", "SQL", "dbt", "DuckDB", "Data quality tests", "Parquet", "GitHub Actions", "pytest"] },
  { slug: "job-skill-tracker", title: "Job market skill tracker", tracks: ["de", "bi"], live: true,
    what: "Collects job postings in Germany every day and extracts skills, seniority and language requirements.",
    headline: "Runs daily and updates its own report; 48 tests",
    skills: ["Python", "pandas", "GitHub Actions", "REST APIs", "Parquet", "pytest"] },
  { slug: "energy-market-airflow-etl", title: "Energy market pipeline", tracks: ["de"],
    what: "Airflow pipeline for German electricity prices, with daily loads and data-quality checks.",
    headline: "Load shifting would have cut a 2 MW job's October energy cost by 35 %",
    skills: ["Python", "Airflow", "ETL / ELT", "Data quality tests", "Docker", "REST APIs", "pytest"] },
  { slug: "kg-etl-pipeline", title: "Knowledge graph ETL", tracks: ["de"],
    what: "ETL from JSON, YAML and XML into an RDF knowledge graph, with a FastAPI interface.",
    headline: "Pydantic validation; 13 tests in CI",
    skills: ["Python", "ETL / ELT", "Pydantic", "FastAPI", "pytest", "CI/CD"] },

  // Machine learning
  { slug: "credit-default-model", title: "Credit default model", tracks: ["ml"], featured: true,
    what: "Default risk for 30,000 credit card customers, with calibration, SHAP, MLflow and a model card.",
    headline: "AUC 0.784; cost of wrong decisions 17 % below the analyst rule",
    skills: ["Python", "LightGBM", "scikit-learn", "SHAP", "MLflow", "pandas", "pytest"] },
  { slug: "demand-forecast", title: "Retail demand forecast", tracks: ["ml"], featured: true,
    what: "28-day sales forecasts for 3,049 Walmart products, backtested against simple baselines.",
    headline: "6.8 % store-level error, vs 15.1 % for a 28-day average",
    skills: ["Python", "LightGBM", "Time series", "pandas", "Parquet", "pytest"] },
  { slug: "dax-risk-monitor", title: "DAX risk monitor", tracks: ["ml"], featured: true, live: true,
    what: "Weekly 99 % Value-at-Risk for 15 DAX stocks with four models, backtested over 20 years.",
    headline: "Only 1 of 4 models passes the backtest: 15 exceptions vs 10.4 expected",
    skills: ["Python", "Time series", "Statistics", "GitHub Actions", "pandas", "pytest"] },
  { slug: "german-news-classifier", title: "German news classifier", tracks: ["ml", "ai"],
    what: "Fine-tuned German BERT compared with a TF-IDF baseline on 10,000 news articles.",
    headline: "90.7 % accuracy vs 87.1 %, at 620× the CPU cost",
    skills: ["Python", "PyTorch", "Hugging Face", "NLP", "scikit-learn", "pytest"] },
  { slug: "industry4-semiconductor-quality-monitoring", title: "Wafer failure early warning", tracks: ["ml"],
    what: "Flags failing wafers from real fab sensor data with PCA, an autoencoder and Isolation Forest.",
    headline: "About 2× more failures caught than random inspection",
    skills: ["Python", "scikit-learn", "PyTorch", "pytest"] },
  { slug: "f1-race-predictor", title: "F1 race predictor", tracks: ["ml"],
    what: "Predicts Formula 1 finishing positions from qualifying, standings, form and track history.",
    headline: "Matches the strong \"finish = grid\" baseline (0.63 vs 0.62)",
    skills: ["Python", "XGBoost", "scikit-learn", "pandas"] },
  { slug: "FLM", title: "Federated learning on non-IID data", tracks: ["ml"],
    what: "A central PyTorch model compared with synchronous and asynchronous federated training.",
    headline: "Six clients with skewed data",
    skills: ["Python", "PyTorch"] },

  // Data & BI
  { slug: "retail-sales-powerbi", title: "Retail sales dashboard", tracks: ["bi"], featured: true,
    what: "Power BI dashboard on 1 million retail transactions, with a star schema and DAX measures.",
    headline: "Revenue +2.5 %, driven by order size, not order count",
    skills: ["Power BI", "DAX", "Python", "pandas", "pytest"] },
  { slug: "controlling-report", title: "Monthly controlling report", tracks: ["bi", "pm"], featured: true,
    what: "Budget vs actual report in Excel from SAP cost exports, with status colours and commentary.",
    headline: "Every export reconciled before reporting; 19 tests",
    skills: ["Python", "Excel", "pandas", "Status reporting", "pytest"] },
  { slug: "email-ab-test", title: "E-mail A/B test", tracks: ["bi", "ml", "pm"],
    what: "Analysis of an e-mail experiment with 64,000 customers, ending in a decision memo.",
    headline: "+$0.77 revenue per customer vs no e-mail",
    skills: ["Python", "A/B testing", "Statistics", "pandas", "pytest"] },
  { slug: "IT-asset-compliance-tracker", title: "IT asset compliance tracker", tracks: ["bi", "pm"],
    what: "Excel IT asset register with Python automation and licence reconciliation.",
    headline: "Audit-ready ISO 27001 evidence pack",
    skills: ["Python", "Excel", "pandas", "pytest", "CI/CD"] },

  // Product & project
  { slug: "order-automation-case-study", title: "Order automation case study", tracks: ["pm", "ai"], featured: true,
    what: "PRD and Excel business case for an AI agent that enters customer orders.",
    headline: "€89k a year net benefit, 8-month payback",
    skills: ["PRDs", "Business cases", "Excel", "GDPR"] },
  { slug: "sample-tracker", title: "Product sample tracker", tracks: ["pm"],
    what: "Excel tracker for product development samples, with a dashboard and data checks.",
    headline: "Weekly PowerPoint status deck in one command",
    skills: ["Excel", "PowerPoint", "Status reporting", "Python", "pandas", "pytest"] },
  { slug: "IT-governance-status-reporter", title: "IT governance status reporter", tracks: ["pm"],
    what: "Turns Jira tickets into PMO reports with KPI trends and RAG status.",
    headline: "One-page steering committee report from Jira",
    skills: ["Jira", "Agile / Scrum", "Status reporting", "Python", "Excel", "REST APIs", "CI/CD"] },
  { slug: "ai-use-case-assessment-eu-ai-act", title: "AI use case assessment", tracks: ["pm", "ai"],
    what: "Prioritises AI use cases by value and feasibility and checks them against the EU AI Act.",
    headline: "Risk tier for every use case, plus a portfolio matrix",
    skills: ["Business cases", "EU AI Act", "GDPR", "Status reporting", "Python", "Excel"] },

  // QA
  { slug: "qa-coverage-tool", title: "QA coverage tool", tracks: ["qa", "ai"],
    what: "Generates test scenarios from feature descriptions with an LLM and tracks coverage gaps.",
    headline: "Python and TypeScript regression suites in CI",
    skills: ["Python", "TypeScript", "pytest", "Groq", "CI/CD"] },
  { slug: "playwright-e2e-suite", title: "Playwright end-to-end suite", tracks: ["qa"],
    what: "Browser tests for a web app: creating, editing, filtering and deleting items.",
    headline: "Runs on every push in GitHub Actions",
    skills: ["Python", "Playwright", "pytest", "CI/CD"] },
];

// "Skills in demand": job-skill-tracker's skill names -> where I have used them.
// "skills" matches project skills; "note" is evidence outside projects; "partial" is partial evidence.
window.MARKET_EVIDENCE = {
  "Python": { skills: ["Python"] },
  "SQL": { skills: ["SQL"], note: "and MySQL at Cognizant" },
  "Excel": { skills: ["Excel"] },
  "MS Office": { skills: ["Excel", "PowerPoint"] },
  "LLM / GenAI": { skills: ["LangChain", "RAG", "Groq"], note: "and Azure OpenAI at Cognizant" },
  "CI/CD": { skills: ["CI/CD", "GitHub Actions"] },
  "SAP": { partial: "SAP cost exports in controlling-report, not the SAP system itself" },
  "Agile / Scrum": { skills: ["Agile / Scrum"], note: "and the Agile SDLC at Cognizant" },
  "TypeScript": { skills: ["TypeScript"] },
  "JavaScript": { note: "this website" },
  "Machine learning": { skills: ["scikit-learn", "LightGBM", "XGBoost"] },
  "Deep learning": { skills: ["PyTorch"] },
  "PyTorch": { skills: ["PyTorch"] },
  "scikit-learn": { skills: ["scikit-learn"] },
  "NLP": { skills: ["NLP"] },
  "Azure": { note: "Azure OpenAI at Cognizant; Azure Fundamentals and Azure AI Fundamentals certified" },
  "AWS": { partial: "AWS Cloud Practitioner certificate, no project yet" },
  "GCP": { partial: "Google Generative AI Leader certificate, no project yet" },
  "Linux": { note: "shell scripting at Cognizant" },
  "Docker": { skills: ["Docker"] },
  "Git": { note: "every project" },
  "Jira": { skills: ["Jira"] },
  "REST APIs": { skills: ["REST APIs", "FastAPI"] },
  "ETL": { skills: ["ETL / ELT"] },
  "dbt": { skills: ["dbt"] },
  "Airflow": { skills: ["Airflow"] },
  "Power BI": { skills: ["Power BI"] },
  "Statistics": { skills: ["Statistics"] },
};

window.EXPERIENCE = [
  { when: "Oct 2024 – now", where: "FAU Erlangen-Nürnberg", what: "M.Sc. International Information Systems",
    detail: "Machine learning, process analytics, federated learning, knowledge discovery in databases. Log-mining project with Munich Airport: parsing warehouse automation logs to find recurring failures." },
  { when: "Apr 2023 – Sep 2024", where: "Cognizant, Pune", what: "Programmer Analyst (Prompt Engineer)",
    detail: "Built enterprise chatbots with LangChain and Azure OpenAI, cutting response times to internal questions by 40 %. Python ML pipelines in an Agile team." },
  { when: "Mar 2022 – Sep 2022", where: "Cognizant, Pune", what: "Data Integration Intern",
    detail: "Automated data ingestion and validation pipelines with Python, MySQL and shell scripting." },
  { when: "Aug 2018 – May 2022", where: "Savitribai Phule Pune University", what: "B.E. Computer Engineering, honours in Data Science",
    detail: "Thesis: social media sentiment analysis with NLP and machine learning." },
];

window.CERTS = [
  { name: "Generative AI Leader", issuer: "Google Cloud", year: 2026 },
  { name: "Azure AI Fundamentals", issuer: "Microsoft", year: 2024 },
  { name: "Azure Fundamentals", issuer: "Microsoft", year: 2024 },
  { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
];

window.EXTRAS = [
  "English C1 (IELTS) · German B1, learning · Hindi and Marathi native",
  "EELISA student ambassador at FAU",
  "Vienna International Centre MUN 2026: delegate in UNCITRAL, the UN trade law committee",
  "EELISA seasonal school in Agrigento, Italy: drone surveys and 3D models of a UNESCO site",
];

// Fallback numbers if GitHub can't be reached; the page fetches the latest ones.
window.LIVE_FALLBACK = {
  dax: { last_week: "2026-11-06", var: 0.0554 },
  db: { last_day: "2026-10-31", cats: [["S-Bahn", 0.933], ["regional", 0.837], ["long distance", 0.593]] },
  jobs: { postings: 788, week: "2026-11-02" },
};
