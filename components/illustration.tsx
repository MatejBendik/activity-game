import type { Activity } from "@/lib/words";
export function Illustration({
  activity = "opis",
  className = "",
}: {
  activity?: Activity | "party" | "trophy";
  className?: string;
}) {
  return (
    <svg
      className={`block overflow-visible ${className}`}
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="160" cy="200" rx="93" ry="9" fill="#dfd5c4" opacity=".35" />
      {activity === "opis" && (
        <>
          <path
            d="M79 58c0-20 17-37 38-37h104c21 0 38 17 38 37v59c0 21-17 38-38 38h-16l-29 29 3-29h-62c-21 0-38-17-38-38Z"
            fill="#d6c3f0"
            transform="rotate(-7 160 100)"
          />
          <path
            d="M61 79c0-21 17-38 38-38h105c21 0 38 17 38 38v55c0 21-17 38-38 38h-55l-35 30 2-30H99c-21 0-38-17-38-38Z"
            fill="#9061ce"
            stroke="#7043ae"
            strokeWidth="3"
          />
          <path
            d="M92 73h114"
            stroke="#bc98e9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {[111, 151, 191].map((x) => (
            <circle key={x} cx={x} cy="112" r="10" fill="#fff7eb" />
          ))}
          <path
            d="m263 51 12-13m-6 37 17-3M45 119l-17 6m15-32-12-5"
            stroke="#d7a13e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="m248 165 7 10 13-4-7 11 7 11-13-3-8 10 1-13-12-5 12-4Z"
            fill="#edba62"
          />
        </>
      )}
      {activity === "kreslenie" && (
        <>
          <rect
            x="80"
            y="32"
            width="156"
            height="157"
            rx="12"
            transform="rotate(7 158 110)"
            fill="#eee2ce"
          />
          <rect
            x="68"
            y="26"
            width="156"
            height="157"
            rx="12"
            transform="rotate(-5 146 105)"
            fill="#fffcf4"
            stroke="#d8c9b2"
            strokeWidth="2"
          />
          <path
            d="m89 149 34-42 29 25 32-39 25 49M93 160h109"
            stroke="#c4b0db"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="109" cy="75" r="14" fill="#f6c65c" />
          <g transform="rotate(35 205 105)">
            <rect
              x="191"
              y="22"
              width="28"
              height="126"
              rx="3"
              fill="#efa14c"
              stroke="#c97b36"
              strokeWidth="2"
            />
            <path d="M191 148h28l-14 34Z" fill="#efd3b5" />
            <path d="m200 171 5 11 5-11" fill="#433d4b" />
            <rect x="191" y="15" width="28" height="21" rx="7" fill="#db7a89" />
            <path d="M192 38h26M205 43v99" stroke="#ffe1a7" strokeWidth="5" />
          </g>
          <path
            d="m53 57-11-9m18-6-3-13m192 127 14 6"
            stroke="#9667cc"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {activity === "pantomima" && (
        <>
          <circle cx="160" cy="105" r="84" fill="#e1ede2" />
          <path
            d="M115 184c-13-20-28-39-32-56-3-12 10-18 17-9l18 21-11-69c-2-13 14-16 17-3l11 48-1-67c0-14 17-15 18-1l3 64 13-61c3-13 19-9 16 4l-10 61 20-40c6-12 21-4 15 8l-20 57c-7 23-18 35-19 43"
            fill="#e9ad80"
            stroke="#b97955"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="m115 184 57-1 3 21h-63Z" fill="#3d8c73" />
          <path
            d="M119 142c9-7 22-9 34-2"
            stroke="#b97955"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="m80 76-12-10m26-10-4-16m132 43 15-5m-20-17 9-13"
            stroke="#429176"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="m230 139 5 9 10 2-8 7 1 11-9-6-10 4 3-10-6-8 10-1Z"
            fill="#e6b955"
          />
        </>
      )}
      {activity === "party" && (
        <>
          <circle cx="159" cy="109" r="86" fill="#eee5f5" />
          <g transform="rotate(-13 110 110)">
            <path
              d="M41 62a19 19 0 0 1 19-19h75a19 19 0 0 1 19 19v50a19 19 0 0 1-19 19h-25l-23 24v-24H60a19 19 0 0 1-19-19Z"
              fill="#9061ce"
            />
            <circle cx="73" cy="86" r="7" fill="#fff9ee" />
            <circle cx="98" cy="86" r="7" fill="#fff9ee" />
            <circle cx="123" cy="86" r="7" fill="#fff9ee" />
          </g>
          <g transform="rotate(18 220 105)">
            <rect
              x="210"
              y="23"
              width="23"
              height="123"
              rx="5"
              fill="#eea449"
            />
            <path d="m210 146 11.5 26L233 146" fill="#e5c9aa" />
            <path d="m217 162 4.5 10 4.5-10" fill="#3e3648" />
            <rect x="210" y="18" width="23" height="19" rx="5" fill="#e18b9f" />
          </g>
          <path
            d="m118 192-8-48c-2-9 10-12 13-3l6 20-2-45c0-11 12-12 13-1l3 40 8-43c2-11 15-8 13 3l-6 40 13-27c5-9 16-3 12 6l-11 40c-3 10-7 15-10 22"
            fill="#e9ad80"
            stroke="#b97955"
            strokeWidth="2"
          />
          <path d="m116 190 48 3-2 20-47-3" fill="#38866f" />
          <path
            d="m52 151 6 10 12-2-8 9 2 12-10-6-11 5 4-12-7-9 12 1Z"
            fill="#edbc5d"
          />
          <path
            d="m250 62 13-10m-4 30 15 1M148 23l-2-12m123 132-5 12"
            stroke="#c9a0dd"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="73" cy="29" r="5" fill="#df8e6e" />
          <circle cx="234" cy="186" r="5" fill="#73a693" />
        </>
      )}
      {activity === "trophy" && (
        <>
          <circle cx="160" cy="102" r="84" fill="#f6ebcc" />
          <path
            d="M114 51H88v24c0 27 20 39 44 39m74-63h26v24c0 27-20 39-44 39"
            stroke="#c58b30"
            strokeWidth="12"
          />
          <path
            d="M107 36h106l-7 57c-3 31-19 47-46 47s-43-16-46-47Z"
            fill="#efbd59"
            stroke="#d59a3a"
            strokeWidth="3"
          />
          <path d="M127 48h15l-1 54c0 13-7 15-10-1Z" fill="#ffe4a2" />
          <path d="M151 138h18v35h-18Z" fill="#dba342" />
          <path d="M127 172h66l7 18h-80Z" fill="#9861cc" />
          <path
            d="m160 63 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z"
            fill="#fff4d1"
          />
          <path
            d="m62 50 7 9m182 63 12-5m-42-93 6-12m-151 142-7 12"
            stroke="#9563c6"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
