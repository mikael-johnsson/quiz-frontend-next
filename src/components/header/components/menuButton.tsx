import styles from "./menuButton.module.css";
import Image from "next/image";
import icon from "../../../../public/bars-solid-full.svg";
type MenuToggleButtonProps = {
  isOpen: boolean;
  controlsId: string;
  onToggle: () => void;
};

const MenuButton = ({
  isOpen,
  controlsId,
  onToggle,
}: MenuToggleButtonProps) => {
  return (
    <button
      id="hamburgerButton"
      className={styles.button}
      type="button"
      aria-label={isOpen ? "Stang meny" : "Oppna meny"}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      <Image src={icon} alt="Hamburgermeny" width={25} height={25}></Image>
    </button>
  );
};

export default MenuButton;
