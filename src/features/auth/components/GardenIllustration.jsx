import { Check, Leaf, Sprout } from "lucide-react";
import "../auth.css";

export default function GardenIllustration() {
  return (
    <div className="garden-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-sun" />
      <div className="art-hill hill-back" />
      <div className="art-hill hill-front" />
      <div className="art-tree tree-left">
        <Sprout />
      </div>
      <div className="art-tree tree-main">
        <Sprout />
      </div>
      <div className="art-tree tree-right">
        <Sprout />
      </div>
      <div className="art-label">
        <span>
          <Leaf size={19} />
        </span>
        <div>
          <strong>Ekosistem yang bertumbuh</strong>
          <small>Dikelola dengan lebih terarah</small>
        </div>
        <Check size={17} />
      </div>
    </div>
  );
}
