import ApplyButton from "./ApplyButton";

export default function SignupCTA() {
  return (
    <div className="py-12">
      <div className="flex max-w-7xl mx-auto px-8">
        <div className="w-2/3">
          <h3 className="font-cal text-5xl text-white">
            Join us at IvyHacks 2024
          </h3>
          <p className="mt-4 font-light text-white">
            Sign up in minutes and get ready to hack!
          </p>
        </div>
        <div className="pt-6 w-1/3 relative">
          <ApplyButton />
        </div>
      </div>
    </div>
  );
}
