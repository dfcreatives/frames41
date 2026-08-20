import Icon from '../ui/Icon'

export default function TrustFeatureBar() {
  const features = [
    {
      id: 'shipping',
      icon: 'local_shipping',
      title: 'Shipping From ₹75',
      subtitle: '',
    },
    {
      id: 'handcrafted',
      isBrandBadge: true,
      brandText: 'HANDCRAFT',
      title: '100% Handcrafted',
      subtitle: 'Premium Wood',
    },
    {
      id: 'dispatch',
      icon: 'bolt',
      title: 'Fast Express Dispatch',
      subtitle: '',
    },
    {
      id: 'payment',
      icon: 'verified_user',
      title: 'Razorpay & COD Available',
      subtitle: '',
    },
  ]

  return (
    <section className="w-full bg-[#1b050c] border-t border-b border-rose-500/20 py-4 px-4 sm:px-8 text-amber-100 shadow-inner">
      <div className="max-w-container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center justify-between">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-center gap-2.5 sm:gap-3 py-1 px-2 text-center sm:text-left transition-all hover:text-amber-300"
            >
              {item.isBrandBadge ? (
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
                  <span className="font-headline tracking-widest text-xs sm:text-sm font-black text-amber-400 border-r-0 sm:border-r border-rose-500/40 pr-0 sm:pr-2.5 uppercase">
                    {item.brandText}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-amber-200/90 whitespace-nowrap">
                    {item.title} <span className="hidden sm:inline text-amber-300 font-semibold">{item.subtitle}</span>
                  </span>
                </div>
              ) : (
                <>
                  <Icon
                    name={item.icon || 'star'}
                    className="text-amber-400 text-lg sm:text-xl shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-medium text-amber-100/90 leading-tight">
                    {item.title}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
