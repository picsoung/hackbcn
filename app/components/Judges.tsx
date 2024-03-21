import DummyPhoto from "public/judges/DummyPhoto.jpg";

const members = [
  {
    name: "Judge 1",
    description: "Bloomberg, CTO",
    image: DummyPhoto,
  },
  {
    name: "Judge 2",
    description: "Google, CEO",
    image: DummyPhoto,
  },
  {
    name: "Judge 3",
    description: "Microsoft, AI Expert",
    image: DummyPhoto,
  },
  {
    name: "Judge 4",
    description: "Lebron, AI Prompter",
    image: DummyPhoto,
  },
  {
    name: "Judge 5",
    description: "J'Dilla, Legendary Producer",
    image: DummyPhoto,
  },
  {
    name: "Judge 6",
    description: "Lil bro, some godly dude",
    image: DummyPhoto,
  },
];

export default function Judges() {
  return (
    <div id="judges" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            Judges
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {members.map((member) => (
              <div key={member.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl sm:text-2xl font-bold leading-7 text-gray-900">
                  <span className="h-5 w-20 flex-none text-indigo-600" aria-hidden="true" />
                  {member.name}
                </dt>
                <dd className="mt-2">
                  <div>
                    <img src={member.image.src} alt={member.name} width="300" height="300" style={{border: '2px solid black'}} />
                  </div>
                  <div className="mt-4 flex flex-auto flex-col text-lg leading-7 text-gray-800">
                    <p className="flex-auto">{member.description}</p>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
