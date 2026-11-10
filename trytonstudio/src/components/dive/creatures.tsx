import type { ReactElement } from 'react'
import type { CreatureId } from '../../content'

/**
 * Illustrations of the discoveries (RF-14). Drawn by hand as SVG, in the
 * colours of the design system, so the repository carries no image files
 * (RNF-11). They are decorative: the fact next to each one carries the meaning.
 */

type CreatureProps = { className?: string }

function Turtle({ className }: CreatureProps) {
  return (
    <svg viewBox="0 0 480 260" className={className} fill="none">
      <defs>
        <linearGradient id="turtle-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd3e0" />
          <stop offset="1" stopColor="#41758f" />
        </linearGradient>
        <linearGradient id="turtle-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67b1c4" />
          <stop offset="1" stopColor="#2b5a78" />
        </linearGradient>
      </defs>
      {/* far flipper and tail */}
      <path
        d="M318 96 C330 62 366 34 410 28 C404 56 380 86 346 108 Z"
        fill="#2b5a78"
        opacity="0.8"
      />
      <path d="M126 146 L92 138 L120 160 Z" fill="#2b5a78" />
      {/* rear flipper */}
      <path
        d="M150 162 C122 170 92 194 74 214 C104 214 146 198 176 174 Z"
        fill="url(#turtle-skin)"
      />
      {/* belly */}
      <path
        d="M120 150 C180 186 320 190 392 150 C380 180 330 200 250 202 C180 202 136 182 120 150 Z"
        fill="#d3e3ea"
        opacity="0.55"
      />
      {/* shell */}
      <path
        d="M116 150 C122 92 214 54 300 72 C356 84 392 116 394 150 C340 178 196 182 116 150 Z"
        fill="url(#turtle-shell)"
      />
      <path
        d="M150 138 C176 100 230 82 286 88 M196 160 C210 122 252 100 300 100 M254 166 C262 136 296 116 340 118 M316 164 C322 146 344 134 372 134 M176 110 L214 152 M236 88 L266 150 M300 90 L318 146"
        stroke="#123a5a"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M150 112 C190 78 250 68 300 78"
        stroke="#eefafc"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* head */}
      <path
        d="M384 128 C402 110 440 108 454 126 C460 142 446 158 424 160 C408 160 394 154 386 150 Z"
        fill="url(#turtle-skin)"
      />
      <circle cx="432" cy="128" r="5" fill="#04101f" />
      <circle cx="433.5" cy="126.5" r="1.6" fill="#eefafc" />
      <path
        d="M440 148 C446 147 451 144 454 140"
        stroke="#123a5a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* near flipper */}
      <path
        d="M326 166 C344 196 332 236 282 254 C270 246 296 214 290 178 Z"
        fill="url(#turtle-skin)"
      />
      <path
        d="M318 182 C324 204 314 226 296 240"
        stroke="#eefafc"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )
}

function Squid({ className }: CreatureProps) {
  return (
    <svg viewBox="0 0 520 240" className={className} fill="none">
      <defs>
        <linearGradient id="squid-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9c8c" />
          <stop offset="1" stopColor="#8a3d4c" />
        </linearGradient>
      </defs>
      {/* two long feeding tentacles */}
      <path
        d="M286 118 C340 96 380 150 430 122 C452 110 470 112 486 120"
        stroke="#b85a62"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="496" cy="124" rx="16" ry="7" transform="rotate(18 496 124)" fill="#b85a62" />
      <path
        d="M286 128 C336 160 372 110 420 150 C440 166 458 170 476 166"
        stroke="#b85a62"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="486" cy="164" rx="16" ry="7" transform="rotate(-10 486 164)" fill="#b85a62" />
      {/* eight arms, six of them visible */}
      <g stroke="url(#squid-body)" strokeLinecap="round">
        <path d="M284 106 C320 84 352 96 384 78" strokeWidth="9" />
        <path d="M288 112 C330 100 362 122 404 102" strokeWidth="8" />
        <path d="M290 122 C330 122 356 140 396 132" strokeWidth="8" />
        <path d="M288 132 C326 146 350 150 388 164" strokeWidth="8" />
        <path d="M284 138 C316 160 344 168 372 190" strokeWidth="9" />
        <path d="M280 142 C300 168 322 184 342 206" strokeWidth="7" opacity="0.8" />
      </g>
      {/* fins, mantle, head */}
      <path
        d="M30 120 C44 82 92 60 128 76 C100 92 88 106 84 120 C88 134 100 148 128 164 C92 180 44 158 30 120 Z"
        fill="#b85a62"
      />
      <path
        d="M30 120 C90 86 190 84 258 100 L258 142 C190 158 90 154 30 120 Z"
        fill="url(#squid-body)"
      />
      <path
        d="M70 112 C120 96 190 94 244 104"
        stroke="#ffd2c8"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M252 102 C276 98 296 106 300 122 C296 138 276 146 252 140 Z"
        fill="url(#squid-body)"
      />
      <g fill="#ffd2c8" opacity="0.35">
        <circle cx="120" cy="124" r="3" />
        <circle cx="150" cy="134" r="2.4" />
        <circle cx="182" cy="126" r="3" />
        <circle cx="212" cy="136" r="2.4" />
        <circle cx="96" cy="130" r="2" />
      </g>
      {/* the largest eye in the animal kingdom deserves a highlight */}
      <circle cx="276" cy="120" r="12" fill="#eefafc" />
      <circle cx="278" cy="120" r="7.5" fill="#04101f" />
      <circle cx="281" cy="117" r="2.4" fill="#eefafc" />
    </svg>
  )
}

function Angler({ className }: CreatureProps) {
  return (
    <svg viewBox="0 0 480 280" className={className} fill="none">
      <defs>
        <linearGradient id="angler-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24456a" />
          <stop offset="1" stopColor="#0b1830" />
        </linearGradient>
        <radialGradient id="angler-glow">
          <stop offset="0" stopColor="#5ff2e0" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#5ff2e0" stopOpacity="0.18" />
          <stop offset="1" stopColor="#5ff2e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="402" cy="70" r="70" fill="url(#angler-glow)" />
      {/* tail and fins */}
      <path
        d="M118 162 C92 138 64 124 34 116 C50 148 50 176 34 212 C64 202 92 188 118 162 Z"
        fill="#162c4a"
      />
      <path d="M176 92 C192 62 224 50 250 56 C236 68 228 82 228 96 Z" fill="#162c4a" />
      <path d="M190 226 C200 250 224 262 246 258 C236 246 232 234 232 222 Z" fill="#162c4a" />
      {/* body */}
      <path
        d="M112 162 C112 104 176 70 246 76 C306 82 350 108 362 138 L300 146 L356 186 C340 224 300 246 240 246 C172 246 112 222 112 162 Z"
        fill="url(#angler-body)"
      />
      <path
        d="M150 128 C186 96 236 88 286 100"
        stroke="#67b1c4"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* mouth and teeth */}
      <path d="M362 138 L300 146 L356 186 C364 172 366 154 362 138 Z" fill="#04101f" />
      <path
        d="M313 144.3 L318 157 L323 143 Z M327 142.5 L332 156 L337 141.2 Z M341 140.7 L346 154 L351 139.4 Z M321 161 L325 151 L331 168.1 Z M335 171 L339 160.5 L345 178.1 Z M347 179.6 L351 170 L356 186 Z"
        fill="#eefafc"
      />
      {/* eye */}
      <circle cx="304" cy="118" r="8" fill="#8fd3e0" />
      <circle cx="306" cy="118" r="4" fill="#04101f" />
      {/* pectoral fin */}
      <path d="M218 176 C204 196 204 214 214 228 C232 216 242 198 244 180 Z" fill="#24456a" />
      {/* the lure */}
      <path
        d="M286 82 C292 36 342 16 392 58"
        stroke="#548ba2"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="402" cy="70" r="11" fill="#5ff2e0" />
      <circle cx="398" cy="66" r="3.5" fill="#eefafc" />
    </svg>
  )
}

function Whale({ className }: CreatureProps) {
  return (
    <svg viewBox="0 0 560 240" className={className} fill="none">
      <defs>
        <linearGradient id="whale-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a6384" />
          <stop offset="1" stopColor="#10233f" />
        </linearGradient>
      </defs>
      {/* flukes */}
      <path
        d="M470 126 C498 96 528 82 548 78 C538 104 536 120 540 128 C536 136 538 154 548 182 C528 176 498 160 470 126 Z"
        fill="#1a3555"
      />
      {/* body: the head is a third of the animal */}
      <path
        d="M24 104 C24 78 42 62 72 62 L250 66 C330 70 410 96 478 122 L478 132 C410 152 330 170 250 172 L170 172 L80 160 C46 152 24 138 24 104 Z"
        fill="url(#whale-body)"
      />
      <path
        d="M60 80 C120 70 220 72 300 86"
        stroke="#8fd3e0"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* narrow lower jaw */}
      <path d="M58 156 C96 172 140 180 186 176 L188 168 C144 168 100 162 66 148 Z" fill="#0b1830" />
      <path
        d="M78 160 L84 166 M98 165 L104 171 M118 169 L124 175 M138 171 L144 177 M158 172 L164 178"
        stroke="#eefafc"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* dorsal hump, flipper, eye, skin folds */}
      <path d="M346 88 C358 74 372 76 382 96 Z" fill="#3a6384" />
      <path d="M214 164 C222 190 246 204 268 200 C258 186 248 172 240 160 Z" fill="#1a3555" />
      <circle cx="176" cy="136" r="4.5" fill="#04101f" />
      <circle cx="177.2" cy="134.8" r="1.4" fill="#eefafc" />
      <path
        d="M280 110 C320 112 360 120 400 132 M276 126 C316 128 352 134 388 144 M284 142 C314 144 340 148 364 154"
        stroke="#0b1830"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* scars from squid suckers, a detail of real sperm whales */}
      <g stroke="#8fd3e0" strokeWidth="1.6" opacity="0.4">
        <circle cx="96" cy="112" r="5" />
        <circle cx="112" cy="124" r="3.5" />
        <circle cx="84" cy="128" r="3" />
      </g>
    </svg>
  )
}

function Wreck({ className }: CreatureProps) {
  return (
    <svg viewBox="0 0 560 280" className={className} fill="none">
      <defs>
        <linearGradient id="wreck-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3b5c" />
          <stop offset="1" stopColor="#081223" />
        </linearGradient>
        <linearGradient id="wreck-floor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0c1a33" stopOpacity="0" />
          <stop offset="0.2" stopColor="#0c1a33" />
          <stop offset="0.8" stopColor="#0c1a33" />
          <stop offset="1" stopColor="#0c1a33" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wreck-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.82" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="wreck-mask">
          <rect width="560" height="280" fill="url(#wreck-fade)" />
        </mask>
      </defs>
      <g transform="rotate(-2.5 280 246)">
        {/* fallen foremast, resting on the bridge as in the real wreck */}
        <path d="M176 100 L372 60" stroke="#24456a" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M236 88 L236 70 M300 75 L300 58"
          stroke="#24456a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* hull: stem, forecastle, well deck, what is left of the superstructure */}
        <path
          d="M58 98 L84 246 L470 246 L486 196 L462 190 L470 150 L440 146 L446 96 L410 92 L404 70 L330 70 L326 96 L300 96 L300 124 L236 124 L236 100 Z"
          fill="url(#wreck-hull)"
        />
        <path
          d="M58 98 L236 100"
          stroke="#67b1c4"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* railing on the bow */}
        <path
          d="M60 84 L232 86 M62 84 V98 M92 84.4 V98 M122 84.8 V99 M152 85.2 V99 M182 85.6 V100 M212 86 V100 M232 86 V100"
          stroke="#548ba2"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* anchor and hawse pipe */}
        <circle cx="100" cy="126" r="5" fill="#04101f" />
        <path
          d="M100 131 V160 M88 150 C90 164 110 164 112 150 M94 138 H106"
          stroke="#548ba2"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* portholes */}
        <g fill="#04101f">
          {[150, 176, 202, 228, 254, 280, 306, 332, 358, 384, 410, 436].map((x) => (
            <circle key={x} cx={x} cy={166} r="3.4" />
          ))}
          {[164, 190, 216, 242, 268, 294, 320, 346, 372, 398, 424].map((x) => (
            <circle key={x} cx={x} cy={196} r="3.4" />
          ))}
          {[340, 362, 384].map((x) => (
            <rect key={x} x={x - 5} y={80} width="10" height="9" rx="1.5" />
          ))}
        </g>
        {/* rusticles hanging from every edge */}
        <g fill="#ff7d6b" opacity="0.42">
          <path d="M70 100 L74 122 L78 100 Z M118 100 L121 116 L125 100 Z M160 100 L164 126 L168 100 Z M204 100 L207 114 L210 100 Z" />
          <path d="M244 124 L248 148 L252 124 Z M270 124 L273 138 L276 124 Z M290 124 L293 144 L297 124 Z" />
          <path d="M334 96 L337 112 L340 96 Z M410 96 L414 122 L418 96 Z M430 96 L433 110 L436 96 Z M452 150 L456 172 L460 150 Z" />
        </g>
      </g>
      {/* sediment */}
      <g mask="url(#wreck-mask)">
        <path
          d="M0 250 C70 230 130 244 210 236 C300 228 380 246 460 234 C500 228 530 236 560 230 L560 280 L0 280 Z"
          fill="url(#wreck-floor)"
        />
        <path
          d="M60 258 C120 244 190 254 270 248"
          stroke="#1f3b5c"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <g fill="#5ff2e0">
        <circle cx="508" cy="222" r="2.4" opacity="0.8" />
        <circle cx="524" cy="214" r="1.6" opacity="0.6" />
        <circle cx="30" cy="238" r="2" opacity="0.7" />
      </g>
    </svg>
  )
}

const drawings: Record<CreatureId, (props: CreatureProps) => ReactElement> = {
  turtle: Turtle,
  squid: Squid,
  angler: Angler,
  whale: Whale,
  wreck: Wreck,
}

export function Creature({ id, className }: { id: CreatureId; className?: string }) {
  const Drawing = drawings[id]
  return <Drawing className={className} />
}
