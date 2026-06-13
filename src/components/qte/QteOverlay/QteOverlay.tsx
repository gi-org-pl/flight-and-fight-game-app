import { COLORS } from "@/constants/common";
import MashQte from "../MashQte/MashQte";
import RecallQte from "../RecallQte/RecallQte";
import SequenceQte from "../SequenceQte/SequenceQte";
import TimingQte from "../TimingQte/TimingQte";
import TriviaQte from "../TriviaQte/TriviaQte";
import type { QteOverlayProps } from "./QteOverlay.types";

const ROLE_LABEL: Record<string, string> = {
  attacker: "ATTACK",
  defender: "DEFEND",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
};

const QteOverlay = ({ definition, onClose }: QteOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mauve/50">
      <div
        className="nes-container with-title animate-qte-enter is-dark"
        style={{ minWidth: 360, background: COLORS.MAUVE }}
      >
        <p className="title">
          {ROLE_LABEL[definition.role]} — LVL{" "}
          {DIFFICULTY_LABEL[definition.difficulty]}
        </p>
        {definition.type === "mash" && (
          <MashQte definition={definition} onComplete={onClose} />
        )}
        {definition.type === "trivia" && (
          <TriviaQte definition={definition} onComplete={onClose} />
        )}
        {definition.type === "sequence" && (
          <SequenceQte definition={definition} onComplete={onClose} />
        )}
        {definition.type === "timing" && (
          <TimingQte definition={definition} onComplete={onClose} />
        )}
        {definition.type === "recall" && (
          <RecallQte definition={definition} onComplete={onClose} />
        )}
      </div>
    </div>
  );
};

export default QteOverlay;
