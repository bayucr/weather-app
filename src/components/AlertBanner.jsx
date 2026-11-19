import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getWeatherAlerts } from "../utils/weatherAlerts";

const STYLES = {
  danger: {
    box: "bg-rose-500/10 border-rose-500/40 text-rose-100",
    icon: "text-rose-400",
    Icon: ShieldAlert,
  },
  warning: {
    box: "bg-amber-500/10 border-amber-500/40 text-amber-100",
    icon: "text-amber-400",
    Icon: AlertTriangle,
  },
};

export default function AlertBanner({ next24Hours, unit }) {
  const alerts = useMemo(
    () => getWeatherAlerts(next24Hours, unit),
    [next24Hours, unit],
  );

  if (alerts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
      aria-label="Peringatan cuaca"
    >
      {alerts.map((alert) => {
        const style = STYLES[alert.level];
        const Icon = style.Icon;
        return (
          <div
            key={alert.id}
            role="alert"
            className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${style.box}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
            <div>
              <p className="font-semibold">{alert.title}</p>
              <p className="mt-0.5 opacity-90">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}
