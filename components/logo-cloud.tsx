export function LogoCloud() {
  const companies = [
    "Pizzeria Roma",
    "Fresh Cuts Salon",
    "Tech Repair Pro",
    "Bella Boutique",
    "Fitness First Gym",
    "Coffee Corner",
  ]

  return (
    <section className="py-16 border-y border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-8">
          {"Trusted by 2,500+ local businesses worldwide"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="text-lg font-semibold">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
