import { motion } from "framer-motion";
import { UserCheck, Vote, Shield, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "Verify Identity",
    description: "Securely authenticate using your unique voter ID. Your identity is verified without exposing personal data.",
  },
  {
    icon: Vote,
    title: "Cast Your Vote",
    description: "Select your preferred candidate and submit your encrypted vote to the blockchain network.",
  },
  {
    icon: Shield,
    title: "Blockchain Recording",
    description: "Your vote is cryptographically signed and recorded on an immutable distributed ledger.",
  },
  {
    icon: CheckCircle,
    title: "Instant Verification",
    description: "Receive a unique transaction hash to verify your vote was recorded correctly.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How <span className="text-gradient-primary">Blockchain Voting</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple 4-step process that ensures your vote is secure, transparent, and tamper-proof.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
