export default function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a href={`https://wa.me/${whatsappNumber}`} aria-label="WhatsApp" style={buttonStyle}>
      ✆
    </a>
  );
}

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  right: 22,
  bottom: 22,
  width: 58,
  height: 58,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  textDecoration: 'none',
  background: 'linear-gradient(135deg, #10b981, #14b8a6)',
  color: 'white',
  fontSize: 26,
  fontWeight: 700,
  boxShadow: '0 18px 36px rgba(20, 184, 166, 0.35)',
  zIndex: 50,
};
