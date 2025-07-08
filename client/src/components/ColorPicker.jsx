import useMetaStore from "../store/useMetaStore";

export default function ColorPicker({ color, onChange }) {
    const colorMap = useMetaStore((state) => state.colorMap);

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {Object.keys(colorMap).map((preset) => (
                    <div
                        key={preset}
                        style={{
                            background: colorMap[preset],
                            width: "24px",
                            height: "24px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            border:
                                color === preset
                                    ? "2px solid black"
                                    : "1px solid #ccc",
                        }}
                        onClick={() => onChange(preset)}
                    />
                ))}
            </div>
        </div>
    );
}
