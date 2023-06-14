import './AnimatedText.css';

export default function AnimatedText({ size = '100px', text = "text", marginTop = "25px" }) {
    return (
        <div style={{ width: '95dvw' }} >
            <h3 style={{ fontSize: size, lineHeight: size, marginTop }} className="animate-character">{text}</h3>
        </div>
    );
}