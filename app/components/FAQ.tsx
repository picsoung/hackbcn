import Question from "./Question";

const QUESTIONS = [
  {
    title: "What can I build?",
    answer:
      "Anything your heart desires! Whether it's an app, a website, a game, or something uniquely innovative, as long as it relates to our theme and guidelines. Let your creativity run wild and showcase your skills!",
    category: "Project",
  },
  {
    title: "What if I don't have coding experience?",
    answer:
      "No worries at all! HackBCN is about learning and growth. We encourage participants of all skill levels to join. You'll find plenty of workshops and mentors to help you get started and make the most out of the event.",
    category: "Participation",
  },
  {
    title: "Who can attend?",
    answer:
      "HackBCN is open to everyone - students, professionals, and hobbyists. Whether you're a beginner or an expert, if you're excited about technology and innovation, we want you here!",
    category: "Participation",
  },
  {
    title: "Can I work on existing project?",
    answer:
      "To keep the playing field level and encourage fresh ideas, participants should start a new project during the hackathon. However, feel free to brainstorm and gather your thoughts before the event!",
    category: "Project",
  },
  {
    title: "What should I bring?",
    answer:
      "Bring your laptop, charger, any tech accessories you might need, and a positive attitude! We'll take care of food and drinks.",
    category: "Logistics",
  },
  {
    title: "What if I don't have a team?",
    answer:
      "No team? No problem! We'll have team formation and networking activities at the start of the hackathon. It's a great opportunity to meet new people and form a team with participants who share your interests.",
    category: "Participation",
  },
  {
    title: "I don't know anything about AI",
    answer:
      "Don't worry we are all here to learn and start somewhere. In most cases playing with AI it's just an API call away. We will have mentors to help you out shape your idea and discuss technical solutions",
    category: "Participation",
  },
  {
    title: "Can I participate remotely?",
    answer:
      "We aim for HackBCN to be the kickoff of a local community of AI practicioners, here in Barcelona. We will give priority to participants that can attend in-person.",
    category: "Participation",
  },
];

export default function FAQ({ padding = false }) {
  type Question = { title: string; answer: string };
  type GroupedQuestions = { [category: string]: Question[] };

  const groupedQuestions = QUESTIONS.reduce<GroupedQuestions>(
    (acc, question) => {
      const { category, title, answer } = question;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ title, answer });
      return acc;
    },
    {}
  );

  return (
    <div id="faq" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl divide-y divide-orange-900/10">
          <h2 className="text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            FAQ
          </h2>
          <div className={`${padding ? "faq-padding" : ""} grid grid-cols-2 gap-4`}>
            {/* {Object.entries(groupedQuestions).map(([category, questions]) => (
              <div key={category}>
                <h2>{category}</h2> */}
            {QUESTIONS.map((q, index) => (
              <Question key={index} title={q.title} answer={q.answer} />
            ))}
            {/* </div>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
}
