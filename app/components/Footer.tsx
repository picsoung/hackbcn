export default function Footer({ padding = false }) {
  return (
    <footer>
      <div
        className={`mx-auto max-w-7xl ${
          padding ? "px-6 lg:px-8" : ""
        } py-6 md:flex md:items-center md:justify-between`}
      >
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-lg leading-5 text-white">
            &copy; 2024. Brought to you from BCN with{" "}
            <span style={{ color: "red" }}>&#x2764;</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
