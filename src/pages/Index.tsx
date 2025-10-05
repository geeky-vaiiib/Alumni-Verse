import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, TrendingUp, Calendar, Award, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RippleGrid } from '@/components/RippleGrid';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Navbar */}
      <Navbar />

      {/* Animated Ripple Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <RippleGrid />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center mb-6">
              <Sparkles className="h-16 w-16 text-primary glow-effect" />
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold">
              <span className="text-gradient">AlumniVerse</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connect, Engage, and Grow with Your Alumni Network
            </motion.p>

            <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground/80 max-w-xl mx-auto">
              Join thousands of alumni from SIT who are building meaningful connections, 
              sharing opportunities, and fostering lifelong relationships.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                className="glow-effect text-lg px-8 py-6 group"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 hover:bg-primary/10 transition-all"
                onClick={() => navigate('/directory')}
              >
                Browse Alumni
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Everything You Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform designed for alumni to stay connected and thrive together
          </p>
        </motion.div>

        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={fadeInUp} className="card-gradient p-6 rounded-2xl border border-border/50 hover-lift text-center group">
            <Users className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Alumni Network</h3>
            <p className="text-muted-foreground">
              Connect with alumni across batches and branches
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="card-gradient p-6 rounded-2xl border border-border/50 hover-lift text-center group">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Real-time Feed</h3>
            <p className="text-muted-foreground">
              Stay updated with live posts and announcements
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="card-gradient p-6 rounded-2xl border border-border/50 hover-lift text-center group">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Events & Reunions</h3>
            <p className="text-muted-foreground">
              Never miss an alumni event or reunion
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="card-gradient p-6 rounded-2xl border border-border/50 hover-lift text-center group">
            <Award className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
            <p className="text-muted-foreground">
              Discover job opportunities and mentorship
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-gradient p-12 rounded-3xl border border-border/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">10K+</div>
              <div className="text-muted-foreground">Alumni</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">50+</div>
              <div className="text-muted-foreground">Events</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">100+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">15+</div>
              <div className="text-muted-foreground">Branches</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-gradient p-12 rounded-3xl border border-border/50 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Ready to Reconnect?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of alumni already using AlumniVerse to stay connected, 
            discover opportunities, and build their network.
          </p>
          <Button
            size="lg"
            className="glow-effect text-lg px-8 py-6 group"
            onClick={() => navigate('/auth')}
          >
            Join Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 AlumniVerse. Built for SIT Alumni Community.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
