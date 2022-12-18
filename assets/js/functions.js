// @codekit-prepend "/vendor/hammer-2.0.8.js";
document.getElementById("overlay").addEventListener("contextmenu", function(event){
  event.preventDefault();
  event.stopPropagation();
});

console.log
(
  "            ____\n"+
  "  ________ |   .|\n" +
  " /        \\|____| if a turtle loses its shell\n" +
  "<|_________/        is it naked or homeless\n" +
  " |_|_| |_|_|\n"
)

const $circle = document.querySelector('.card__circle');
const $smallCircle = document.querySelector('.card__smallCircle');
const $year = document.querySelector('.card__year');
const $card = document.querySelector('.card');
const $cardOrangeShine = document.querySelector('.card__orangeShine');
const $cardThankYou = document.querySelector('.card__thankyou');
const $cardComet = document.querySelector('.card__cometOuter');
const generateTranslate = (el, e, value) => {
  el.style.transform = `translate(${e.clientX * value}px, ${e.clientY * value}px)`;
};
// http://stackoverflow.com/a/1480137
const cumulativeOffset = element => {
  var top = 0,
    left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);
  return {
    top: top,
    left: left
  };
};
document.onmousemove = event => {
  const e = event || window.event;
  const x = (e.pageX - cumulativeOffset($card).left - 350 / 2) * -1 / 100;
  const y = (e.pageY - cumulativeOffset($card).top - 350 / 2) * -1 / 100;
  const matrix = [[1, 0, 0, -x * 0.00005], [0, 1, 0, -y * 0.00005], [0, 0, 1, 1], [0, 0, 0, 1]];
  generateTranslate($smallCircle, e, 0.03);
  generateTranslate($cardThankYou, e, 0.03);
  generateTranslate($cardOrangeShine, e, 0.09);
  generateTranslate($circle, e, 0.05);
  generateTranslate($year, e, 0.03);
  generateTranslate($cardComet, e, 0.05);
  $card.style.transform = `matrix3d(${matrix.toString()})`;
};


// https://stackoverflow.com/questions/5786851/define-a-global-variable-in-a-javascript-function
// var     left = $('.slider--item-left'),
//           $center = $('.slider--item-center'),
//           $right = $('.slider--item-right');
var locations = 
[
    {
      name: "Dumbo",
      map: [-73.990038, 40.704488],
      turtle: [-73.99204, 40.706280]
    },
    {
      name: "NYU",
      map: [-73.997457, 40.730823],
      turtle: [-73.997457, 40.730823]
    }
]

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}
var randomDic = locations.random();

// $( document ).ready(function() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2Fub2tlaSIsImEiOiJjbDh3M2RsNzkwanZqM29vNDduNW52amg5In0.SSwVPJSPg5z-BNhYIufsJQ';
  const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/dark-v10',
    center: randomDic.map, 
    zoom: 16,
    interactive: false,
    pitch: 45
  });
    
  function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  }
    // parameters to ensure the model is georeferenced correctly on the map
  const modelOrigin = randomDic.turtle;
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, 0, 0];
  
  const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
  modelOrigin,
  modelAltitude
  );
  
  // transformation parameters to position, rotate and scale the 3D model onto the map
  const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  /* Since the 3D model is in real world meters, a scale transform needs to be
  * applied since the CustomLayerInterface expects units in MercatorCoordinates.
  */
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };
  
  const THREE = window.THREE;
  
  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map, gl) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      
      // create two three.js lights to illuminate the model
      const color = 0xFFFFFF;
      const intensity = 100;
      const light = new THREE.AmbientLight(color, intensity);
      this.scene.add(light);
      
      // use the three.js GLTF loader to add the 3D model to the three.js scene
      const loader = new THREE.GLTFLoader();
      loader.load(
        'https://cdn.glitch.global/ff996a1b-fade-4b92-9204-556d38ecd023/Turtle_Model.glb?v=1664519111621',
        (gltf) => {
          gltf.scene.scale.multiplyScalar(1.5);
          this.scene.add(gltf.scene);
        }
      );

      this.map = map;
      
      // use the Mapbox GL JS map canvas for three.js
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      
      this.renderer.autoClear = false;
      },
      render: function (gl, matrix) {
      const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
      );
      
      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
      .makeTranslation(
      modelTransform.translateX,
      modelTransform.translateY,
      modelTransform.translateZ
      )
      .scale(
      new THREE.Vector3(
        modelTransform.scale,
        -modelTransform.scale,
        modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);
      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
      }
    };
  
  map.on('style.load', () => {
    map.addLayer(customLayer, 'waterway-label');
  });

  map.on('load', () => {
    // Start the animation.
    rotateCamera(0);
      
    // Add 3D buildings and remove label layers to enhance the map
    // const layers = map.getStyle().layers;
    // for (const layer of layers) {
    //   if (layer.type === 'symbol' && layer.layout['text-field']) {
    //     // remove text labels
    //     map.removeLayer(layer.id);
    //     }
    // }
    
    map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 16,
    'paint': {
    'fill-extrusion-color': '#aaa',
      
    // use an 'interpolate' expression to add a smooth transition effect to the
    // buildings as the user zooms in
    'fill-extrusion-height': [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'height']
    ],
    'fill-extrusion-base': [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.6
    }
    });
  });
  // DOMMouseScroll included for firefox support
  var canScroll = true,
      scrollController = null;
  $(this).on('mousewheel DOMMouseScroll', function(e){

    if (!($('.outer-nav').hasClass('is-vis'))) {

      e.preventDefault();

      var delta = (e.originalEvent.wheelDelta) ? -e.originalEvent.wheelDelta : e.originalEvent.detail * 20;

      if (delta > 50 && canScroll) {
        canScroll = false;
        clearTimeout(scrollController);
        scrollController = setTimeout(function(){
          canScroll = true;
        }, 800);
        updateHelper(1);
      }
      else if (delta < -50 && canScroll) {
        canScroll = false;
        clearTimeout(scrollController);
        scrollController = setTimeout(function(){
          canScroll = true;
        }, 800);
        updateHelper(-1);
      }

    }

  });

  $('.side-nav li, .outer-nav li').click(function(){

    if (!($(this).hasClass('is-active'))) {

      var $this = $(this),
          curActive = $this.parent().find('.is-active'),
          curPos = $this.parent().children().mousedown().index(curActive),
          nextPos = $this.parent().children().index($this),
          lastItem = $(this).parent().children().length - 1;

      updateNavs(nextPos);
      updateContent(curPos, nextPos, lastItem);

    }

  });

  $('.next-tele, .prev-tele, .curr-tele').click(function(){
    var $this = $(this);
    var curActive = $('.side-nav').find('.is-active'),
      curPos = $('.side-nav').children().index(curActive),
      lastItem = $('.side-nav').children().length - 4,
      nextPos = lastItem;

    var   $left_perm = $('.slider--perm-left'),
          $center_perm = $('.slider--perm-center'),
          $right_perm = $('.slider--perm-right'),
          $left = $('.slider--item-left'),
          $center = $('.slider--item-center'),
          $right = $('.slider--item-right');
    
    $left.removeClass('slider--item-left');
    $center.removeClass('slider--item-center');
    $right.removeClass('slider--item-right');

    if($this.hasClass('next-tele')){
      $left_perm.addClass('slider--item-right');
      $center_perm.addClass('slider--item-left');
      $right_perm.addClass('slider--item-center');
    }
    else if($this.hasClass('prev-tele')){
      $left_perm.addClass('slider--item-center');
      $center_perm.addClass('slider--item-right')
      $right_perm.addClass('slider--item-left');
    }
    else
    {
      $left_perm.addClass('slider--item-left');
      $center_perm.addClass('slider--item-center');
      $right_perm.addClass('slider--item-right');
    }

    updateNavs(lastItem);
    updateContent(curPos, nextPos, lastItem);
  });

  $('.cta').click(function(){

    var curActive = $('.side-nav').find('.is-active'),
        curPos = $('.side-nav').children().index(curActive),
        lastItem = $('.side-nav').children().length - 1,
        nextPos = lastItem;

    updateNavs(lastItem);
    updateContent(curPos, nextPos, lastItem);

  });
  $('.homepage-main').click(function(){

    var curActive = $('.side-nav').find('.is-active'),
        curPos = $('.side-nav').children().index(curActive);

    updateNavs(0);
    updateContent(curPos, 0, 0);

  });
  // swipe support for touch devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    var targetElement = document.getElementById('viewport'),
        mc = new Hammer(targetElement);
    mc.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    mc.on('swipeup swipedown', function(e) {

      updateHelper(e);

    });
  }

  $(document).keyup(function(e){

    if (!($('.outer-nav').hasClass('is-vis'))) {
      e.preventDefault();
      updateHelper(e);
    }

  });

  // determine scroll, swipe, and arrow key direction
  function updateHelper(param) {

    var curActive = $('.side-nav').find('.is-active'),
        curPos = $('.side-nav').children().index(curActive),
        lastItem = $('.side-nav').children().length - 1,
        nextPos = 0;

    if (param.type === "swipeup" || param.keyCode === 40 || param > 0) {
      if (curPos !== lastItem) {
        nextPos = curPos + 1;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
      else {
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
    }
    else if (param.type === "swipedown" || param.keyCode === 38 || param < 0){
      if (curPos !== 0){
        nextPos = curPos - 1;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
      else {
        nextPos = lastItem;
        updateNavs(nextPos);
        updateContent(curPos, nextPos, lastItem);
      }
    }

  }

  // sync side and outer navigations
  function updateNavs(nextPos) {

    $('.side-nav, .outer-nav').children().removeClass('is-active');
    $('.side-nav').children().eq(nextPos).addClass('is-active');
    $('.outer-nav').children().eq(nextPos).addClass('is-active');

  }

  // update main content area
  function updateContent(curPos, nextPos, lastItem) {

    $('.main-content').children().removeClass('section--is-active');
    $('.main-content').children().eq(nextPos).addClass('section--is-active');
    $('.main-content .section').children().removeClass('section--next section--prev');

    if (curPos === lastItem && nextPos === 0 || curPos === 0 && nextPos === lastItem) {
      $('.main-content .section').children().removeClass('section--next section--prev');
    }
    else if (curPos < nextPos) {
      $('.main-content').children().eq(curPos).children().addClass('section--next');
    }
    else {
      $('.main-content').children().eq(curPos).children().addClass('section--prev');
    }

    if (nextPos !== 0 && nextPos !== lastItem) {
      $('.header--cta').addClass('is-active');
    }
    else {
      $('.header--cta').removeClass('is-active');
    }

  }

  function outerNav() {

    $('.header--nav-toggle').click(function(){

      $('.perspective').addClass('perspective--modalview');
      setTimeout(function(){
        $('.perspective').addClass('effect-rotate-left--animate');
      }, 25);
      $('.outer-nav, .outer-nav li, .outer-nav--return').addClass('is-vis');

    });

    $('.outer-nav--return, .outer-nav li').click(function(){

      $('.perspective').removeClass('effect-rotate-left--animate');
      setTimeout(function(){
        $('.perspective').removeClass('perspective--modalview');
      }, 400);
      $('.outer-nav, .outer-nav li, .outer-nav--return').removeClass('is-vis');

    });

  }
  
  function workSlider() {
    $('.slider--prev, .slider--next').click(function() {
      var $this = $(this);
      var $left_perm = $('.slider--perm-left'),
          $center_perm = $('.slider--perm-center'),
          $right_perm = $('.slider--perm-right'),
          $left = $('.slider--item-left'),
          $center = $('.slider--item-center'),
          $right = $('.slider--item-right');
      function removeClasses()
      {
        $left.removeClass('slider--item-left');
        $center.removeClass('slider--item-center');
        $right.removeClass('slider--item-right');
      }
      
      function addClasses(a,b,c)
      {
        removeClasses();
        $left_perm.addClass('slider--item-' + a);
        $center_perm.addClass('slider--item-' + b);
        $right_perm.addClass('slider--item-' + c);
      }

      $('.slider').animate({ opacity : 0 }, 400);

        setTimeout(function(){
          if ($this.hasClass('slider--next'))
            if($center_perm.hasClass('slider--item-left'))
              addClasses('center','right','left');
            else if($center_perm.hasClass('slider--item-center'))
              addClasses('right','left','center');
            else
              addClasses('left','center','right');
          else
            if($center_perm.hasClass('slider--item-left'))
              addClasses('left','center','right');
            else if($center_perm.hasClass('slider--item-center'))
              addClasses('center','right','left');
            else
              addClasses('right','left','center');
        }, 400);

      $('.slider').animate({ opacity : 1 }, 400);

    });

  }

  function transitionLabels() {

    $('.work-request--information input').focusout(function(){

      var textVal = $(this).val();

      if (textVal === "") {
        $(this).removeClass('has-value');
      }
      else {
        $(this).addClass('has-value');
      }

      // correct mobile device window position
      window.scrollTo(0, 0);

    });

  }

  outerNav();
  workSlider();
  transitionLabels();

// });
