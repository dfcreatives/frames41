const ANNOUNCEMENT =
  'Crafting Stories in Wood • Free Shipping Above ₹2000 • New Designs Weekly'

export default function AnnouncementBar() {
  return (
    <div
      role="complementary"
      aria-label="Site announcement"
      className="bg-on-background text-background py-2 text-center overflow-hidden"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{ANNOUNCEMENT}</p>
    </div>
  )
}
