import { useIntl } from "./Intl";

export default function Footer({ padding = false }) {
  const intl = useIntl();
  return (
    <footer>
      <div style={{display: 'none'}}>
        {/* <script
          id="formless_embed"
          src="https://embed.formless.ai/embed.js"
          async={true}
          style={{display: 'none'}}
          data-type="trigger"
          data-trigger-type="banner"
          data-trigger-title={intl.t('footer.form.title')}
          data-trigger-subtitle={intl.t('footer.form.subtitle')}
          data-conversation-id="a1DBrrA9bUXA" 
        ></script> */}
      </div>
      <div
        className={`mx-auto max-w-7xl ${
          padding ? "px-6 lg:px-8" : ""
        } py-6 md:flex md:items-center md:justify-between`}
      >
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-lg leading-5 text-white">
            &copy; 2024. {intl.t('footer.signature')}{" "}
            <span style={{ color: "red" }}>&#x2764;</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
