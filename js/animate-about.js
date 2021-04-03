// we don't need so many thresholds
const numSteps = 20.0;

let enteringIndex = 0;
let leavingIndex = 2;
let elements = [];
let sectionIllustrations = []
const MIN_SCALING = 0.1;
const INITIAL_ROTATION = 240;
const SMALL_CIRCLE_CSS_VAR = "--small-circle-size";
const CIRCLE_CSS_VAR = "--circle-size";

function buildThresholdList() {
    let thresholds = [];
    let numSteps = 20;
    
    for (let i=1.0; i<=numSteps; i++) {
        let ratio = i/numSteps;
        thresholds.push(ratio);
    }
    
    thresholds.push(0);
    return thresholds;
}

function handleIntersect(entries) {
    entries.forEach((entry) => {
        const { top } = entry.intersectionRect;
        if ( top > 0) {
            if (entry.intersectionRatio > 0.5) {
                entry.target.style.opacity = 1;
            } else {
                entry.target.style.opacity = 0;
            }
        } else {
            if (entry.intersectionRatio > 0.1 && leavingIndex !== 2) {
                entry.target.style.opacity = 0;
            } else {
                entry.target.style.opacity = 1;
            }
        }
    });
}

function createObserver(targets) {
    let observer;
    
    let options = {
        root: null,
        rootMargin: "0px",
        threshold: buildThresholdList()
    };
    
    observer = new IntersectionObserver(handleIntersect, options);
    targets.forEach(item => observer.observe(item))
}

window.addEventListener("load", (event) => {
    elements = [...document.querySelectorAll(".about__item")];
    sectionIllustrations = [...document.querySelectorAll(".section-illustration")];

    createObserver(elements);
  }, false);

function updateElementsSizes() {
    const innerHeight = window.innerHeight;
    const innerWidth = window.innerWidth;
    const VERTICAL_OFFSET = 300;
    const heightLimits = innerHeight - VERTICAL_OFFSET;
    const screenPart = window.innerWidth > 991 ? 0.4 : 0.9;
    const widthLimits = innerWidth * screenPart;
    console.log('widthLimits', widthLimits)

    const circleSize = heightLimits > widthLimits ? widthLimits : heightLimits;
    const smalleCircleSize = Math.round(circleSize / 4.5);
    let root = document.documentElement;
    console.log("circleSize", circleSize);
    console.log("smalleCircleSize", smalleCircleSize);
    root.style.setProperty(CIRCLE_CSS_VAR, `${circleSize}px`);
    root.style.setProperty(SMALL_CIRCLE_CSS_VAR, `${smalleCircleSize}px`);
}

(function($){
    const $circle = $(".circle");
    let innerHeight = window.innerHeight;
    let innerWidth = window.innerWidth;


    // Calculate initial sizes
    updateElementsSizes()
    $(window).on("resize", () => updateElementsSizes());

    const rotateCircle = () => {
        const scrollTop = $(document).scrollTop();
        const sectionRatio = scrollTop / window.innerHeight;
        const initialRotation = window.innerWidth > 991 ? INITIAL_ROTATION : 330;
        const angle = sectionRatio * 120 + initialRotation;
        const rotationStr = "rotate(-" + angle + "deg)";

        $circle.css({
          "-webkit-transform": rotationStr,
          "-moz-transform": rotationStr,
          "transform": rotationStr
        });
    }

    const setSize = (el, scaleIndex) => {
        const scaleString = `scale(${scaleIndex < MIN_SCALING ? MIN_SCALING : scaleIndex})`;
        $(el).css({
            "-webkit-transform": scaleString,
            "-moz-transform": scaleString,
            "transform": scaleString
        })
    }

    const fixIntroPostion = () => {
        const el = $(".about-intro__content");
        const offsetTop = el[0] && el[0].offsetTop;
        const width = el.width();
        setTimeout(() => {
            $(el).css("top", `${offsetTop}px`);
            $(el).css("width", `${width}px`);
            $(el).addClass("about-intro__content--fixed");
        });        
    }

    const releaseIntroPosition = () => {
        const el = $(".about-intro__content");
        if (el && $(el).hasClass("about-intro__content--fixed")) {
            $(el).css("top", "");
            $(el).css("width", "");
            $(el).removeClass("about-intro__content--fixed")
        }
    }

    $(window).on("scroll", (e) => {
        rotateCircle();

        const scrollTop = $(document).scrollTop();
        const sectionNumber = Math.floor(scrollTop / window.innerHeight);
        const remainder = scrollTop % innerHeight;


        if (sectionNumber === 0) {
            enteringIndex = 0;
            leavingIndex = 2;
        }
        if (sectionNumber === 1) {
            enteringIndex = 1;
            leavingIndex = 0;
        }
        if (sectionNumber === 2) {
            enteringIndex = 2;
            leavingIndex = 1;
        }
        if (sectionNumber === 3) {
            enteringIndex = 0;
            leavingIndex = 2;
        }

        if (sectionNumber > 1 && enteringIndex === 0) {
            fixIntroPostion()
        } else {
            releaseIntroPosition();
        }

        sectionIllustrations.forEach((el, i) => {
            if (i === leavingIndex) {
                const leavingSizeRation = (innerHeight - remainder) / innerHeight;
                setSize(el, leavingSizeRation)
                return;
            }
            if (i === enteringIndex) {
                const sizeRation = remainder / innerHeight;
                setSize(el, sizeRation);
                return
            }
            setSize(el, 0.001);
        })
        
    });

})(jQuery);
