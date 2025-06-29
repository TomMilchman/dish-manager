export default function ActionButton({
    action,
    className,
    title,
    buttonContentIcon,
    buttonContentText = "",
}) {
    return (
        <button className={className} title={title} onClick={action}>
            {buttonContentIcon}
            {buttonContentText}
        </button>
    );
}
