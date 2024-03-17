export default function Sponsors() {
  return (
    <div id="sponsors" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
          Sponsors
        </h2>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto gap-4 mt-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <img
              className="h-auto max-h-32 object-contain bg-black"
              src="/logos/praxis2.jpg"
              alt="Praxis"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/modal2.jpg"
              alt="Modal"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/ctech2.png"
              alt="Cornell Tech"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/meta2.jpg"
              alt="Meta"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/warp2.jpg"
              alt="Warp"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/lastmileai2.jpeg"
              alt="Warp"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/nomic2.jpg"
              alt="Warp"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/prompt2.png"
              alt="Warp"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/cornell.jpg"
              alt="Cornell"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/columbia.jpg"
              alt="Columbia"
            />
            <img
              className="h-auto max-h-32 object-contain"
              src="/logos/nyu.jpg"
              alt="NYU"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
