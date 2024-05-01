import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

export default function FormModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  useEffect(() => {
    console.log('hhhheee', open)
    setIsOpen(open);
  }, [open]); // Only depend on `open` since you're synchronizing `isOpen` with it

  let [isOpen, setIsOpen] = useState(open);

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Panel>
        <Dialog.Title>Apply to HackBCN</Dialog.Title>
        <Dialog.Description>
          How would you like to be involved?
        </Dialog.Description>
        AHAHAHAH
        {/* <iframe
          src="https://formless.ai/c/a1DBrrA9bUXA"
          className="formless-embed"
          width="100%"
          height="600px"
          loading="lazy"
          allow="microphone"
          style={{ border: 0, display: "block" }}
        ></iframe>

        <script src="https://embed.formless.ai/embed.js" async></script> */}

        {/* <button onClick={() => setIsOpen(false)}>Deactivate</button>
        <button onClick={() => setIsOpen(false)}>Cancel</button> */}
      </Dialog.Panel>
    </Dialog>
  );
}
