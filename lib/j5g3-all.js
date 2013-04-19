/**
 * @license
 *
 * j5g3 v0.9.0 - Javascript Graphics Engine
 * http://j5g3.com
 *
 * Copyright 2010-2012, Giancarlo F Bellido
 *
 * j5g3 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * j5g3 is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with j5g3. If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: 2013-04-05 12:06:30 -0400
 *
 */

(function(window, undefined) {
'use strict';

var
	document = window.document,
	/* This is used by the cache mechanism. It is a canvas element. */
	cache,

	extend= function(a, b)
	{
		for (var i in b)
			a[i] = b[i];
	},

	/** 
	 * @namespace 
	 * Creates a new Engine instance on window.load event.
	 */
	j5g3 = window.j5g3 = function(engine)
	{
		window.addEventListener('load', function()
		{
			new j5g3.Engine(engine);
		});
	},

	f= j5g3.factory = function(Klass)
	{
		return function(properties) { return new Klass(properties); };
	}
;
	/**
	 * j5g3 Base class
	 * @constructor
	 * @param {Object} p
	 */
	j5g3.Class = function j5g3Class(p) {
		this.extend(p);
	};

extend(j5g3, {/** @scope j5g3 */

	/**
	 * Returns a DOM element by ID.
	 *
	 * @param {string} id Id of DOM Element
	 */
	id: function(id) { return document.getElementById(id); },

	/**
	 * Adds a callback to the body onLoad event.
	 */
	ready: function(fn) { window.addEventListener('load', fn, false); },

	/**
	 * @return {number} A random number from 0 to max
	 */
	rand: function(max) { return Math.random() * max; },

	/**
	 * @return {number} A random integer number from 0 to max.
	 */
	irand: function(max) { return Math.floor(Math.random() * max); },

	/**
	 * Creates an array of w*h dimensions initialized with value v
	 *
	 * @return {Array} Array
	 */
	ary: function(w, h, v)
	{
	/*jshint maxdepth:4 */
		var result = [], x;

		if (h)
			while (h--)
			{
				result[h] = [];
				for (x=0; x<w; x++)
					result[h][x]=v;
			}
		else
			while (w--)
				result.push(v);

		return result;
	},

	/**
	 * Returns a DOM element.
	 * @namespace
	 *
	 * @param {string} tagname
	 */
	dom: function(tagname)
	{
		return document.createElement(tagname);
	},

	/**
	 * Returns a canvas with w, h dimensions.
	 */
	canvas: function(w, h)
	{
	var
		result = j5g3.dom('CANVAS')
	;
		result.setAttribute('width', w);
		result.setAttribute('height', h);

		return result;
	},

	/**
	 * Gets type of obj. It returns 'dom' for HTML DOM objects, 'audio'
	 * for HTMLAudioElement's and 'j5g3' for j5g3.Class descendants.
	 *
	 * @return {String}
	 */
	get_type: function(obj)
	{
		var result = typeof(obj);

		if (result === 'object')
		{
			if (obj === null) return 'null';
			if (obj instanceof Array) return 'array';
			if (obj instanceof j5g3.Class) return 'j5g3';

			if (obj instanceof window.HTMLElement) return 'dom';
			if (obj instanceof window.HTMLAudioElement) return 'audio';
		}

		return result;
	},

	/** Returns a CanvasGradient object. */
	gradient: function(x, y, w, h)
	{
		return cache.getContext('2d').createLinearGradient(x,y,w,h);
	},

	/** @return {String} A rgba CSS color string */
	rgba: function(r, g, b, a)
	{
		if (a===undefined)
			a = 1;

		return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	},

	/** @return {String} A hsla CSS color string */
	hsla: function(h, s, l, a)
	{
		if (a===undefined)
			a = 1;

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	}

});

/**
 * Returns a new DOM Element with tag tag and src attribute src.
 *
 * @param {string} tag
 * @param {string} uri
 *
 */
j5g3.dom.src= function(tag, uri)
{
var
	el = document.createElement(tag)
;
	el.setAttribute('src', uri);
	return el;
};

/**
 * Returns an HTML Image object from a URI uri
 *
 * @param {string} uri
 */
j5g3.dom.image= function(uri)
{
	return j5g3.dom.src('img', uri);
};

/**
 *
 * Uses methods.init as the constructor. If not passed it will define a function
 * and call the base constructor. Sets 'super' as the base class.
 *
 * @param {Object} methods Class instance methods.
 * @param {Object=} static_methods Static Methods.
 *
 */
j5g3.Class.extend = function(methods, static_methods)
{
/*jshint maxstatements:20 */
var
	i,
	_super  = this,
	init   = methods.init || function() { _super.apply(this, arguments); },
	/** @constructor @ignore */
	Subclass= function() { },
	/** @type {Object} */
	method
;
	Subclass.prototype = _super.prototype;

	init.prototype = new Subclass();
	init.prototype.constructor = init;
	init.prototype.base = _super.prototype;

	init.extend = j5g3.Class.extend;

	for(i in methods)
		if (methods.hasOwnProperty(i))
		{
			// TODO Maybe not use ECMA5 properties
			method = Object.getOwnPropertyDescriptor(methods, i);
			Object.defineProperty(init.prototype, i, method);
		}

	for (i in static_methods)
		if (static_methods.hasOwnProperty(i))
		{
			method = Object.getOwnPropertyDescriptor(static_methods, i);
			Object.defineProperty(init, i, method);
		}

	return init;
};

/**
 * Extends this instance with properties from p
 */
j5g3.Class.prototype.extend = function(p)
{
	for (var i in p)
		this[i] = p[i];
};

/**
 * This are all the core drawing algorithms. "this" will point to the current
 * object.
 *
 * @namespace
 */
j5g3.Draw =
{
	/**
	 * Draws nothing
	 */
	Void: function() { },

	/**
	 * Default drawing algorithm.
	 */
	Default: function(context)
	{
		this.begin(context);
		this.paint(context);
		this.end(context);
	},

	/**
	 * Draw with no transformations applied. Faster...
	 */
	NoTransform: function(context)
	{
		this.paint(context);
	},

	/**
	 * Renders to render canvas then draws to main canvas.
	 */
	Root: function()
	{
		var context = this.context;
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.begin(context);
		this.paint(context);
		this.end(context);

		this.screen.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.screen.drawImage(this.renderCanvas, 0, 0);
	},

	/**
	 * Draws Image with no transformations only translation
	 */
	FastImage: function(context)
	{
		context.drawImage(this.source, this.x, this.y);
	},

	/**
	 * Drawing Algorithm for cached display objects.
	 */
	Cache: function(context)
	{
		context.drawImage(
			this.source, this.x, this.y, this.width, this.height,
			this.x, this.y, this.width, this.height
		);
	}
};

/**
 * Paint Algorithms. Use this to draw you custom objects after all
 * transformation are applied. Replace the Draw function to add extra
 * steps to the draw process.
 *
 * @namespace
 */
j5g3.Paint = {

	/**
	 * Paints image stored in this.source.
	 */
	Image: function (context)
	{
		context.drawImage(this.source, this.cx, this.cy);
	},

	/**
	 * Drawing function for Sprites
	 */
	Sprite: function (context)
	{
	var
		src = this.source,
		w = this.width,
		h = this.height
	;
		context.drawImage(
			src.image, src.x, src.y, src.w, src.h,
			this.cx, this.cy, w ? w : src.w, h ? h : src.h
		);
	},

	/**
	 * Paint function for Clips and other containers.
	 */
	Container: function (context)
	{
	var
		frame = this.frame,
		next = frame
	;
		while ((next=next.next) !== frame)
			next.draw(context);

		if (this._playing)
			this.next_frame();
	},

	/**
	 * Draws text using fillText
	 */
	Text: function(context)
	{
		context.fillText(this.text, this.cx, this.cy);
	},

	/**
	 * Draws text with multiline support.
	 */
	MultilineText: function(context)
	{
	var
		text = this.text.split("\n"),
		i = 0,
		l = text.length,
		y = 0
	;
		for (;i<l;i++)
		{
			context.fillText(text[i], this.cx, this.cy + y);
			y += this.line_height;
		}
	},

	/**
	 * Draws text using strokeText function.
	 */
	TextStroke: function(context)
	{
		context.strokeText(this.text, this.cx, this.cy);
	},

	/**
	 * Paints a 2D map.
	 */
	Map: function(context)
	{
		var map = this.map, y = map.length, x, sprites = this.sprites, s, cm;

		context.translate(0, y*this.th);

		while (y--)
		{
			x = map[y].length;
			cm= map[y];

			context.translate(x*this.tw, -this.th);

			while (x--)
			{
				context.translate(-this.tw, 0);
				if ((s = sprites[cm[x]]))
					s.draw(context);
			}
		}
	},

	/**
	 * Paints an isometric map.
	 */
	Isometric: function(context)
	{
	var
		map = this.map, y = 0, x, l=map.length,
		sprites = this.sprites, cm,
		dx = Math.round(this.tw/2) + this.offsetX,
		dy = Math.round(this.th/2) + this.offsetY,
		offset
	;

		context.translate(-dx, -dy);

		for (; y<l; y++)
		{
			x = map[y].length;
			cm= map[y];
			offset = (y%2) ? dx : -dx;

			context.translate(x*this.tw-offset, dy);

			while (x--)
			{
				context.translate(-this.tw, 0);
				sprites[cm[x]].draw(context);
			}

		}

	}

};

/**
 *
 * @namespace
 *
 * Caching algorithms for j5g3.DisplayObjects
 *
 */
j5g3.Cache = {

	/**
	 * Caches content into a separate canvas. TODO Optimize
	 */
	Canvas: function(context, w, h)
	{
	var
		me = this,
		pc = context,
		cache_canvas = j5g3.dom('CANVAS')
	;
		w = w || me.width;
		h = h || me.height;

		// This will also clear the canvas.
		cache_canvas.width = me.x + w;
		cache_canvas.height= me.y + h;

		context = cache_canvas.getContext('2d');
		me.clear_cache();

		me.draw(context);

		me.source = cache_canvas;

		me._oldPaint= me.draw;
		me.draw = j5g3.Draw.Cache;

		context = pc;

		return this;
	},

	/**
	 * Switches context to CACHE context and executes fn.
	 */
	use: function(context, fn, scope)
	{
	var
		result
	;
		// TODO put cache context somewhere?
		result = fn(scope, cache.getContext('2d'));

		return result;
	}

};


/**
 * @namespace
 * Hit test algorithms. Assign to 'at' function.
 */
j5g3.HitTest = {

	Circle: function(x, y, M)
	{
		M = M ? M.product(this.M, this.x, this.y) : this.M.to_m(this.x, this.y);
		M.to_client(x, y);

		return (M.x*M.x+M.y*M.y <= this.radius*this.radius) ? this : false;
	},

	Container: function(x, y, M)
	{
	var
		frame = this.frame,
		previous = frame,
		result
	;
		M = M ? M.product(this.M, this.x, this.y) : this.M.to_m(this.x, this.y);

		while ((previous = previous.previous) !== frame)
			if ((result = previous.at(x, y, M)))
				break;

		return result;
	},

	Rect: function(x, y, M)
	{
		M = M ? M.product(this.M, this.x, this.y) : this.M.to_m(this.x, this.y);
		M.to_client(x, y);

		return ((M.x>0 && M.x<this.width)&&(M.y>0 && M.y<this.height)) ? this : false;
	},

	Polygon: function(x, y, M)
	{
	var
		points = this.points,
		normals = this.normals,
		i = 0, l = points.length,
		dot
	;
		M = M ? M.product(this.M, this.x, this.y) : this.M.to_m(this.x, this.y);
		M.to_client(x, y);

		for (; i<l; i+=2)
		{
			dot = normals[i]*(M.x-points[i]) + normals[i+1]*(M.y-points[i+1]);
			if (dot > 0.0)
				return false;
		}

		return this;
	}

};

/**
 * Light 2D Transformation Matrix for DisplayObjects. Use j5g3.Matrix to 
 * perform operations. e and f are always 0.
 *
 * [ a c ]
 * [ b d ]
 *
 * @extend {j5g3.Class}
 * @class
 */
j5g3.MatrixLite = j5g3.Class.extend(/** @scope j5g3.MatrixLite.prototype */{

	a: 1,
	b: 0,
	c: 0,
	d: 1,

	_cos: 1,
	_sin: 0,

	scaleX: 1,
	scaleY: 1,

	init: function j5g3MatrixLite(a, b, c, d)
	{
		if (a!==undefined)
		{
			this.a = a; this.b = b; this.c = c; this.d = d;
		}
	},

	/** Sets Matrix rotation and calculates a,b,c and d values. */
	setRotation: function(val)
	{
		this._cos = Math.cos(val);
		this._sin = Math.sin(val);

		return this.calc4();
	},

	setScaleX: function(sx)
	{
		this.scaleX = sx;
		return this.calc4();
	},

	setScaleY: function(sy)
	{
		this.scaleY = sy;
		return this.calc4();
	},

	scale: function(sx, sy)
	{
		this.scaleX = sx;
		this.scaleY = sy;
		return this.calc4();
	},

	calc4: function()
	{
		this.a = this.scaleX * this._cos;
		this.b = this.scaleX * this._sin;
		this.c = -this.scaleY * this._sin;
		this.d = this.scaleY * this._cos;
		return this;
	},

	/**
	 * Returns a copy of this matrix as a j5g3.Matrix object.
	 *
	 * @return {j5g3.Matrix}
	 */
	to_m: function(x, y)
	{
		return new j5g3.Matrix(this.a, this.b, this.c, this.d, x || 0, y || 0);
	}
});

/**
 * 2D Transformation Matrix.
 * @class
 * @extend j5g3.Class
 */
j5g3.Matrix = j5g3.Class.extend(/** @scope j5g3.Matrix.prototype */{

	a: 1,
	b: 0,
	c: 0,
	d: 1,
	e: 0,
	f: 0,

	init: function j5g3Matrix(a, b, c, d, e, f)
	{
		if (a!==undefined)
		{
			this.a = a; this.b = b; this.c = c;
			this.d = d; this.e = e; this.f = f;
		}
	},

	multiply: function(g, h, i, j, k, l)
	{
	var
		A = this.a, B = this.b, C = this.c,
		D= this.d
	;
		this.a = A*g + C*h;
		this.b = B*g + D*h;
		this.c = A*i + C*j;
		this.d = B*i + D*j;
		this.e += A*k + C*l;
		this.f += B*k + D*l;

		return this;
	},

	clone: function()
	{
		return j5g3.matrix().multiply(this.a, this.b, this.c, this.d, this.e, this.f);
	},

	/**
	 * Returns a new inverse matrix
	 *
	 * @return {j5g3.Matrix}
	 */
	inverse: function()
	{
	var
		m = this.clone(),
		adbc = this.a*this.d-this.b*this.c
	;
		m.a = this.d / adbc;
		m.b = this.b / -adbc;
		m.c = this.c / -adbc;
		m.d = this.a / adbc;
		m.e = (this.d*this.e-this.c*this.f) / -adbc;
		m.f = (this.b*this.e-this.a*this.f) / adbc;

		return m;
	},

	/**
	 * Multiplies matrix by M and optional x and y
	 *
	 * @return {j5g3.Matrix}
	 */
	product: function(M, x, y)
	{
		return this.clone().multiply(M.a, M.b, M.c, M.d, M.e || x || 0, M.f || y || 0);
	},

	/**
	 * Resets matrix.
	 */
	reset: function()
	{
		this.a = 1; this.b = 0; this.c = 0;
		this.d = 1; this.e = 0; this.f = 0;

		return this;
	},

	/**
	 * Applies only rotation and scaling transformations. Stores it in this.x, this.y.
	 */
	to_world: function(x, y)
	{
		this.x = this.a * x + this.c * y + this.e;
		this.y = this.b * x + this.d * y + this.f;

		return this;
	},

	/**
	 * Finds client x and y and stores it in this.x, this.y respectively.
	 */
	to_client: function(x, y)
	{
	var
		adbc = this.a * this.d - this.b * this.c
	;
		this.x = (this.d*x - this.c*y + this.c*this.f-this.d*this.e)/adbc;
		this.y = (-this.b*x + this.a*y + this.b*this.e-this.a*this.f)/adbc;

		return this;
	}

});

/**
 * @class Base for all classes
 *
 */
j5g3.DisplayObject = j5g3.Class.extend(/** @scope j5g3.DisplayObject.prototype */ {

	/** @type {Image} Used by the draw function to paint the object */
	source: null,

	/**
	 * Next display object to render
	 * @type {j5g3.DisplayObject}
	 */
	next: null,

	/**
	 * Previous display object
	 * @type {j5g3.DisplayObject}
	 */
	previous: null,

	/**
	 * Parent clip
	 * @type {j5g3.Clip}
	 */
	parent: null,

	/**
	 * Transformation Matrix
	 */
	M: null,

	/** @type {number} X position */
	x: 0,

	/** @type {number} Y position */
	y: 0,

	/** @type {number} Offset X for rotation. */
	cx: 0,
	/** @type {number} Offset Y  */
	cy: 0,
	/** @type {number|null} Width */
	width: null,
	/** @type {number|null} Height */
	height: null,

	_rotation: 0,

	/** @type {number} Rotation */
	set rotation(val) { this.M.setRotation((this._rotation = val)); },
	get rotation() { return this._rotation; },

	/** @type {number} X Scale */
	set sx(val) { this.M.setScaleX(val); },
	get sx() { return this.M.scaleX; },

	/** @type {number} Y Scale */
	set sy(val) { this.M.setScaleY(val); },
	get sy() { return this.M.scaleY; },

	/** @type {number} Alpha transparency value */
	alpha: 1,

	/** @type {string} Blending Mode */
	blending: null,

	/**
	 * @type {string} Stroke style.
	 */
	stroke: null,

	/**
	 * @type {string} Fill Style
	 */
	fill: null,

	/**
	 * @type {string} Font
	 */
	font: null,

	/** Line Width for children */
	line_width: null,
	/** Line Cap for children */
	line_cap: null,
	/** Line join for children */
	line_join: null,
	/** Miter limit */
	miter_limit: null,

	dirty: true,

	/** True if display object is being currently drawn */
	is_drawing: false,

	init: function j5g3DisplayObject(properties)
	{
		this.M = new j5g3.MatrixLite();

		this.extend(properties);
	},

	/**
	 * Save Transform Matrix and apply transformations.
	 */
	begin: function(context)
	{
	var
		me = this,
		m = this.M
	;
		me.is_drawing = true;
		context.save();

		if (me.alpha!==1) context.globalAlpha *= me.alpha;
		if (me.fill!==null) context.fillStyle= me.fill;
		if (me.stroke!==null) context.strokeStyle= me.stroke;
		if (me.font) context.font = me.font;
		if (me.blending) context.globalCompositeOperation=me.blending;

		if (me.line_width!==null) context.lineWidth = me.line_width;
		if (me.line_cap!==null) context.lineCap = me.line_cap;
		if (me.line_join!==null) context.lineJoin = me.line_join;
		if (me.miter_limit!==null) context.miterLimit = me.miter_limit;

		context.transform(m.a, m.b, m.c, m.d, me.x, me.y);
	},

	/**
	 * Restores Transform Matrix
	 */
	end: function(context)
	{
		context.restore();
		this.drawing = false;
	},

	/**
	 * Applies Transformations and paints Object in the screen.
	 * To define your custom DisplayObject class implement the paint()
	 * function. Replace this function if you need to add extra
	 * functionality to the draw process, ie: transformations or keyboard handling.
	 */
	draw: j5g3.Draw.Default,

	/**
	 * This property is used to store the old paint method when assigning effects.
	 */
	_paint: null,

	/**
	 * Sets object to dirty and forces paint
	 *
	 * @return {j5g3.DisplayObject} this.
	 */
	invalidate: function()
	{
		this.dirty = true;
		return this;
	},

	/**
	 * Removes DisplayObject from container
	 */
	remove: function()
	{
		if (this.parent)
		{
			this.previous.next = this.next;
			this.next.previous = this.previous;

			this.parent = this.previous = null;
		}
		return this;
	},

	/**
	 * Sets position of the object according to alignment and container.
	 */
	align: function(alignment, container)
	{
		container = container || this.parent;

		switch (alignment) {
		case 'center':  this.x = container.width / 2; break;
		case 'left':    this.x = 0; break;
		case 'right':   this.x = container.width - this.width; break;
		case 'middle':  this.y = container.height / 2; break;
		case 'center middle':
			this.pos(container.width/2, container.height/2);
			break;
		case 'origin':  this.pos(-this.width/2, -this.height/2); break;
		case 'origin top': this.pos(-this.width/2, -this.height); break;
		case 'origin bottom': this.pos(-this.width/2, 0); break;
		}
		return this;
	},

	/**
	 * Sets x and y
	 */
	pos: function(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	},

	size: function(w, h)
	{
		this.width = w;
		this.height = h;
		return this;
	},

	/**
	 * Gets the current transformation matrix, including all the parent's transformations.
	 * Since the transform object is not available until rendering we need to return this using
	 * a callback. Use local_transform() function to get the calculated objects transformation matrix.
	 */
	get_transform: function(callback)
	{
	var
		oldtransform = this.begin
	;
		this.begin = function(context) {
			oldtransform();
			callback(context.currentTransform);
			this.begin = oldtransform;
		};
		return this;
	},

	/**
	 * Moves Display Object relative to the current position
	 */
	move: function(x, y)
	{
		this.x += x;
		this.y += y;
		return this;
	},

	visible: function()
	{
		return this.alpha > 0;
	},

	/**
	 * Sets the scaleX and scaleY properties according to w and h
	 */
	stretch: function(w, h)
	{
		return this.scale(w / this.width, h/this.height);
	},

	/**
	 * Encloses Object into a Clip.
	 */
	to_clip: function()
	{
		return j5g3.clip({width: this.width, height: this.height }).add(this);
	},

	cache: j5g3.Cache.Canvas,

	/**
	 * Restores Paint Method
	 */
	clear_cache: function()
	{
		if (this._oldPaint)
			this.draw = this._oldPaint;
	},

	/**
	 * Sets properties and invalidates object.
	 */
	set: function(properties)
	{
		this.extend(properties);
		return this.invalidate();
	},

	/**
	 * Tests if point at x, y is inside the DisplayObject.
	 */
	at: j5g3.HitTest.Rect,

	/**
	 * Sets scaleX and scaleY values.
	 */
	scale: function(sx, sy)
	{
		this.sx = sx;
		this.sy = sy;
		return this;
	},

	/**
	 * Rotates object by a radians.
	 *
	 * @param {number} a
	 */
	rotate: function(a)
	{
		this.rotation += a;
		return this;
	}

});

/**
 * @class Image Class
 *
 * Constructor takes properties object, a string with the id of an
 * Image or an HTML Image Element.
 *
 * @extends j5g3.DisplayObject
 */
j5g3.Image = j5g3.DisplayObject.extend(
/** @scope j5g3.Image.prototype */ {

	init: function j5g3Image(properties)
	{
		if (typeof(properties)==='string')
			properties = { source: j5g3.id(properties) };
		else if (properties instanceof window.HTMLElement)
			properties = { source: properties };

		j5g3.DisplayObject.apply(this, [ properties ]);

		if (this.source)
			this.set_source(this.source);
	},

	paint: j5g3.Paint.Image,

	_get_source: function(src)
	{
		return (typeof(src)==='string') ? j5g3.id(src) : src;
	},

	/**
	 * Sets the source. If src is a string it will create an Image object.
	 * NOTE: Chrome and Safari (webkit) loads images and css parallely.
	 * So we have to wait for the image to load in order
	 * to get the correct width and height.
	 */
	set_source: function(src)
	{
		this.source = this._get_source(src);

		if (this.width === null)  this.width = this.source.width;
		if (this.height === null) this.height = this.source.height;

		return this.invalidate();
	}

});

/**
 * @class j5g3.Text
 */
j5g3.Text = j5g3.DisplayObject.extend(/** @scope j5g3.Text.prototype */{

	text: '',

	/**
	 * Default line height only for Draw.MultilineText
	 */
	line_height: 12,

	init: function j5g3Text(properties)
	{
		if (typeof properties === 'string')
			properties = { text: properties };

		j5g3.DisplayObject.apply(this, [properties]);
	},

	paint : j5g3.Paint.Text,

	_get_width: function(obj, context)
	{
		obj.begin(context);
		var metrics = context.measureText(obj.text);
		obj.end();

		return metrics.width;
	},

	get_width : function()
	{
		return j5g3.Cache.use(this._get_width, this);
	}
});

/**
 * Display HTML
 * @class
 * @extend j5g3.DisplayObject
 * TODO
 */
j5g3.Html = j5g3.DisplayObject.extend({

	html: '',

	init: function j5g3Html(properties)
	{
		if (typeof(properties) === 'string')
			properties = { html: j5g3.dom(properties).innerHTML };

		j5g3.DisplayObject.apply(this, [ properties ]);
	}

});

/**
 * @class Clip
 */
j5g3.Clip = j5g3.DisplayObject.extend(
/** @scope j5g3.Clip.prototype */ {

	/** @private */
	_frames: null,

	/**
	 * @private
	 *
	 * Stores current frame number
	 */
	_frame: 0,

	/** @private */
	_playing: true,

	init: function j5g3Clip(properties)
	{
		j5g3.DisplayObject.apply(this, [ properties ]);

		this._frames = [];
		this.add_frame();

		if (this.setup!==undefined)
			this.setup();
	},

	/** Function to call after construction */
	setup: undefined,

	/**
	 * Current frame objects.
	 */
	frame: null,

	/**
	 * Sets next frame index.
	 */
	next_frame: function()
	{
		this._frame = (this._frame===this._frames.length-1) ? 0 : (this._frame + 1);
		this.frame = this._frames[this._frame];
	},

	paint: j5g3.Paint.Container,

	stop: function() { this._playing = false; return this;},
	play: function() { this._playing = true; return this; },

	is_playing: function() { return this._playing; },

	/**
	 * Adds display_objects to current frame.
	 * If function is passed it converts it to an Action object.
	 */
	add: function(display_object)
	{
		switch (j5g3.get_type(display_object)) {
		case 'function':
			display_object = new j5g3.Action(display_object);
			break;
		case 'string':
			display_object = new j5g3.Image({ source: display_object });
			break;
		case 'array':
			for (var i=0; i < display_object.length; i++)
				this.add(display_object[i]);
			return this;
		case 'audio':
			// TODO
			break;
		case 'dom': case 'object':
			display_object = new j5g3.Image(display_object);
			break;
		case 'undefined': case 'null':
			throw "Trying to add undefined object to clip.";
		}

		return this.add_object(display_object);
	},

	add_object: function(display_object)
	{
	var
		frame = this.frame
	;
		frame.previous.next = display_object;
		display_object.previous = frame.previous;
		display_object.next = frame;
		display_object.parent = this;
		frame.previous = display_object;

		return this;
	},

	/**
	 * Adds a frame with objects inside.
	 */
	add_frame: function(objects)
	{
	var
		frame = { }
	;
		frame.previous = frame.next = frame;

		this._frames.push(frame);
		this.go(this._frames.length-1);

		return objects ? this.add(objects) : this;
	},

	/**
	 * Removes frame
	 */
	remove_frame: function(frame)
	{
		frame = frame===undefined ? this._frame : frame;
		this._frames.splice(frame, 1);
		this.go(frame-1);

		return this;
	},

	/**
	 * Goes to frame
	 */
	go: function(frame)
	{
		this.frame = this._frames[this._frame = frame];
		return this;
	},

	/**
	 * Iterates over all the clip's children. Note: Not in order.
	 */
	each: function(fn)
	{
	var
		l = this._frames.length,
		frame, next
	;
		while (l--)
		{
			next = frame = this._frames[l];
			while ((next=next.next) !== frame)
				fn(next);
		}

		return this;
	},

	/**
	 * Aligns all children
	 */
	align_children : function(alignment)
	{
		return this.each(function(c) { if (c.align) c.align(alignment); });
	},

	/**
	 * Returns element at position x,y
	 */
	at: j5g3.HitTest.Container

});

/**
 * Root Clips
 * @class
 * @extend j5g3.Clip
 */
j5g3.Stage = j5g3.Clip.extend(/** @scope j5g3.Stage.prototype */{

	/**
	 * Current canvas element.
	 */
	canvas: null,

	/**
	 * Current drawing canvas context.
	 */
	context: null,

	/**
	 * Context for display canvas.
	 */
	screen: null,

	/**
	 * Canvas used for rendering.
	 */
	renderCanvas: null,

	/**
	 * Enable smoothing.
	 * @default false
	 */
	smoothing: false,

	_init_canvas: function()
	{
		if (!this.canvas)
			this.canvas = j5g3.id('screen');

		if (!this.canvas)
		{
			this.canvas = j5g3.dom('CANVAS');
			this.canvas.width = this.width;
			this.canvas.height= this.height;
			window.document.body.appendChild(this.canvas);
		}
	},

	init: function j5g3Stage(p)
	{
		j5g3.Clip.apply(this, [p]);

		this._init_canvas();

		this.renderCanvas = j5g3.dom('CANVAS');
		this.context = this.renderCanvas.getContext('2d');
		this.screen  = this.canvas.getContext('2d');

		this.screen.imageSmoothingEnabled = this.context.imageSmoothingEnabled = this.smoothing;

		this.resolution(
			this.width || this.canvas.clientWidth,
			this.height || this.canvas.clientHeight
		);
	},

	/**
	 * Sets Screen Resolution and Root Width and Height
	 *
	 * @param {number} w Width
	 * @param {number} h Height
	 */
	resolution: function(w, h)
	{
		if (w === 0 || h === 0)
			throw new Error("Invalid stage resolution: " + w + 'x' + h);

		this.canvas.width = this.renderCanvas.width = w;
		this.canvas.height= this.renderCanvas.height= h;

		return this.size(w, h);
	},

	/**
	 * Basic event handling. Attaches handler to canvas event.
	 */
	on: function(event, handler, scope)
	{
		handler.scoped = handler.bind(scope || this);
		this.canvas.addEventListener(event, handler.scoped);
	},

	un: function(event, handler)
	{
		this.canvas.removeEventListener(event, handler.scoped);
	},

	draw: j5g3.Draw.Root

});

/**
 * @class Tween Class
 *
 * @property {Boolean}             auto_remove    Removes tween from clip at
 *           the end. Defaults to false.
 * @property {j5g3.DisplayObject}  target         Object to animate.
 * @property {Object}              from           Start Value(s)
 * @property {Object}              to             Final Value(s)
 * @property {Number}              duration       Duration of tween
 *           in frames. Default to 100 frames.
 * @property {Number}              repeat         How many times to repeat.
 * @property {Number}              t              Current Time of the animation.
 *
 * @property {function}   on_stop
 *
 */
j5g3.Tween = j5g3.DisplayObject.extend(/**@scope j5g3.Tween.prototype */ {

	auto_remove: false,
	repeat: Infinity,
	duration: 100,
	is_playing: false,
	from: null,
	target: null,
	to:   null,
	t: 0,
	/* EVENTS */
	on_stop: null,

	/**
	 * Callback
	 */
	on_remove: null,

	/**
	 * @param {(j5g3.DisplayObject|Object)} properties DisplayObject
	 *        or an Object containing properties.
	 */
	init: function j5g3Tween(properties)
	{
		if (properties instanceof j5g3.Class)
			properties = { target: properties };

		this.draw = this.start;

		this.extend(properties);
	},

	/**
	 * Pause Tween
	 */
	pause: function()
	{
		this._olddraw = this.draw;
		this.draw = function() { };

		return this;
	},

	resume: function()
	{
		this.draw = this._olddraw ? this._olddraw : this.start;

		return this;
	},

	rewind: function() {
		this.repeat -= 1;
		this.t=0;
		this.vf= 0;

		return this;
	},

	/** Recalculates Tween */
	restart: function()
	{
		this.t = 0;
		return this.stop().start();
	},

	stop: function()
	{
		this.pause().rewind();

		if (this.on_stop)
			this.on_stop();

		return this;
	},

	easing: function(p) { return p; },

	apply_tween: function(i, v)
	{
		return this.from[i] + ( this.easing(v) * (this.to[i]-this.from[i]));
	},

	_remove: j5g3.DisplayObject.prototype.remove,

	remove: function()
	{
		if (this.on_remove)
			this.on_remove();
		this._remove();
	},

	_calculate: function()
	{
	var
		me = this,
		target = me.target,
		i
	;
		if (me.duration===me.t)
			me.vf = 1;

		for (i in me.to)
			// TODO See if calling apply_tween affects performance.
			target[i] = me.apply_tween(i, me.vf);

		if (me.t<me.duration)
		{
			me.t++;
			me.vf += me.v;
		} else
		{
			if (me.auto_remove)
				me.remove();
			else if (me.repeat)
				me.rewind();
			else
				me.stop();
		}
	},

	/**
	 * Sets up Tween to act on next Frame draw
	 */
	start: function()
	{
	var
		me = this,
		to = me.to, i, target=me.target
	;

		// Setup function it will be replaced after setting up.
		if (me.from === null)
		{
			me.from = {};
			for (i in to)
				me.from[i] = target[i];
		}

		me.v = 1 / me.duration;
		me.vf= 0;

		me.draw = me._calculate;
		return this;
	},

	draw: null,

	invalidate: function() { return this; }

}, {
	Shake: function(target, radius, duration)
	{
		radius = radius || 3;
		var r2 = radius*2;

		return new j5g3.Tween({
			duration: duration || 10,
			target: target,
			auto_remove: true,
			to: { x: 0, y: 0 },
			apply_tween: function(i, v) { return v===1 ? this.to[i] : -radius+j5g3.rand(r2); }
		});
	}
});

/**
 * @class Sprite
 */
j5g3.Sprite = j5g3.DisplayObject.extend({

	init: function j5g3Sprite(p)
	{
		j5g3.DisplayObject.apply(this, [ p ]);
	},

	paint: j5g3.Paint.Sprite

});

/**
 * @class Spritesheet Class
 *
 * Constructor can take properties object, a string with the filename, an
 * HTML Image or j5g3 Image.
 *
 */
j5g3.Spritesheet = j5g3.Class.extend(/** @scope j5g3.Spritesheet.prototype */ {

	width: 0,
	height: 0,

	/**
	 * Image of the spritesheet. If a string passed it will be converted
	 * to a j5g3.Image
	 */
	source: null,

	/**
	 * @private
	 */
	_sprites: null,

	init: function j5g3Spritesheet(properties)
	{
		switch (j5g3.get_type(properties)) {
		case 'string': case 'dom': case 'j5g3':
			properties = { source: properties };
			break;
		case 'undefined':
			properties = {};
		}

		switch (j5g3.get_type(properties.source)) {
		case 'string': case 'dom':
			properties.source = new j5g3.Image(properties.source);
			break;
		}

		if (properties.width === undefined && properties.source)
			properties.width = properties.source.width;

		if (properties.height === undefined && properties.source)
			properties.height = properties.source.height;

		this.extend(properties);
		this._sprites = [];
	},

	/**
	 * Returns array containing sprites
	 */
	select: function(sprites)
	{
	var
		result = []
	;
		this.each(sprites, function(s) { result.push(s); });

		return result;
	},

	each: function(sprites, fn)
	{
	var
		i=0, l=sprites.length
	;
		for (; i < l; i++)
			fn(this.sprite(sprites[i]));

		return this;
	},

	/**
	 * Creates clip from spritesheet indexes.
	 *
	 * @param {Array} sprites Array of sprites to insert into clip.
	 */
	clip: function(sprites)
	{
	var
		clip = j5g3.clip().remove_frame(),
		w=0, h=0
	;
		this.each(sprites, function(sprite) {
			clip.add_frame(sprite);

			if (sprite.width > w) w = sprite.width;
			if (sprite.height> h) h = sprite.height;
		});

		return clip.size(w, h);
	},

	/**
	 * Cuts a sprite and returns the ss object.
	 */
	push: function(x, y, w, h)
	{
		this.slice(x, y, w, h);
		return this;
	},

	/**
	 * Creates a new slice, inserts it into the sprite list and returns
	 * its ID. The ID can be used by the sprite function.
	 */
	slice: function(x, y, w, h)
	{
			return this._sprites.push({
				width: w, height: h,
				source: { image: this.source.source, x: x, y: y, w: w, h: h }
			})-1;
	},

	/**
	 * Returns a Sprite object from a section of the Spritesheet. It also adds
	 * it to the sprites list.
	 */
	cut: function(x, y, w, h)
	{
		return this.sprite(this.slice(x,y,w,h));
	},

	/**
	 * Divides spritesheet into a grid of y rows and x columns and a
	 * border of b. By default b is 0.
	 */
	grid: function(x, y, b)
	{
		b = b || 0;

	var
		b2 = 2*b,
		w = this.width / x - b2,
		h = this.height / y - b2,
		r,c
	;

		for (r=0; r < y; r++)
			for (c=0; c < x; c++)
				this.slice(c*(w+b2)+b, r*(h+b2)+b, w, h);

		return this;
	},

	/**
	 * Returns a new Sprite object based on index
	 *
	 * @return {j5g3.Sprite}
	 */
	sprite: function(index)
	{
		return new j5g3.Sprite(this._sprites[index]);
	},

	/**
	 * Returns all sprites as objects in an array.
	 *
	 * @return {Array}
	 */
	sprites: function()
	{
	var
		i = 0,
		l = this._sprites.length,
		sprites = []
	;
		for (; i<l; i++)
			sprites.push(this.sprite(i));

		return sprites;
	},

	/**
	 * Returns a map with the sprites property set and the tw and th specified.
	 */
	map: function(tw, th)
	{
		return new j5g3.Map({ sprites: this.sprites(), tw: tw, th: th });
	}

});

/**
 * @class Particle Emitter
 *
 * @extends j5g3.Clip
 */
j5g3.Emitter = j5g3.Clip.extend(/**@scope j5g3.Emitter.prototype */ {

	init: function j5g3Emitter(p)
	{
		j5g3.Clip.apply(this, [p]);
	},

	/**
	 * Class of the object to Emit.
	 * @default j5g3.Clip
	 *
	 */
	source: j5g3.Clip,

	/**
	 * Function used to replace the draw method for the emitted object.
	 */
	container_draw: function(context)
	{
		if (this._life--)
			this._emitter_draw(context);
		else
			this.remove();
	},

	/**
	 * Life of the particle, in frames.
	 */
	life: 10,

	/**
	 * Callback to execute every time a particle is spawn.
	 */
	on_emit: function() { },

	/**
	 * Number of particles to emit by frame.
	 */
	count: 1,

	/**
	 * By default creates a clip containing 'source' for 'life' frames.
	 */
	spawn: function()
	{
	var
		clip = new this.source()
	;
		clip._life = this.life;
		clip._emitter_draw = clip.draw;
		clip.draw = this.container_draw;

		return clip;
	},

	_emit: function()
	{
	var
		clip = this.spawn()
	;
		this.add(clip).on_emit(clip);
	},

	_paint: j5g3.Paint.Container,

	paint: function(context)
	{
	var
		i = this.count
	;
		while (i--)
			this._emit();

		this._paint(context);
	}

});

/**
 * @class Maps an array to a spritesheet.
 *
 * Properties:
 *
 *
 * @extends j5g3.DisplayObject
 *
 */
j5g3.Map = j5g3.DisplayObject.extend(/**@scope j5g3.Map.prototype */ {

	/** Array of sprites */
	sprites: null,
	/** 2D Array containing the indexes of the sprites */
	map: null,
	/** Tile Width */
	tw: 0,
	/** Tile Height */
	th: 0,

	offsetX: 0,
	offsetY: 0,

	init: function j5g3Map(p)
	{
		j5g3.DisplayObject.apply(this, [p]);

		if (this.map===null)
			this.map = [];
	},

	getTileAt: function(x, y)
	{
	var
        me = this,
		nx = Math.round(x / me.tw),
		ny = Math.round(y / (me.th/2 + me.offsetY))
	;

		return this.map[ny][nx];
	},

	/**
	 * Gets the top left coordinate of the tile at x,y for isometric maps.
	 * TODO
	 */
	getIsometricCoords: function(x, y)
	{
	var
		me = this,
		tw2=Math.floor(this.tw/2) + this.offsetX,
		th2=Math.floor(this.th/2)+this.offsetY,
		offset = (y%2)*tw2,

		nx = Math.round(x * me.tw - offset),
		ny = Math.round(y * th2)
		;

		return { x: nx, y: ny };
	},

	/**
	 * Sets the map to Isometric
	 */
	set_iso: function()
	{
		this.paint = j5g3.Paint.Isometric;
		return this;
	},

	paint: j5g3.Paint.Map

});

/**
 * Executes code on FrameEnter.
 *
 * @class
 * @extends j5g3.Class
 *
 */
j5g3.Action = j5g3.Class.extend(
/** @scope j5g3.Action.prototype */ {

	_init: j5g3.Class,

	/**
	 * Code to execute
	 */
	draw: j5g3.Void,

	init: function j5g3Action(p)
	{
		if (j5g3.get_type(p)==='function')
			p = { draw: p };

		this._init(p);
	},

	/**
	 * Remove action from parent clip.
	 */
	remove: j5g3.DisplayObject.prototype.remove

}, /** @scope j5g3.Action */ {

	/**
	 * Rotates object forever. Clockwise by default.
	 *
	 * @param {j5g3.DisplayObject} obj Object to rotate.
	 */
	rotate: function(obj)
	{
		return function() {
			obj.rotation = obj.rotation < 6.1 ? obj.rotation+0.1 : 0;
		};
	}

});

/**
 * @class
 * Engine class
 */
j5g3.Engine = j5g3.Class.extend(/** @scope j5g3.Engine.prototype */{

	version: '0.9.0',

	/**
	 * Whether or not to use animation frame. FPS is always 60.
	 */
	use_animation_frame: true,

	/* Frames per Second */
	__fps: 31,

	/**
	 * Starts the engine.
	 */
	run: function()
	{
	var
		me = this
	;
		if (me.process)
		{
			window.clearInterval(me.process);
			window.clearAnimationFrame(me.process);
		}

		me._scopedLoop = me._gameLoop.bind(me);
		me._rafScopedLoop= me._rafGameLoop.bind(me);

		if (me.use_animation_frame)
			me.process = window.requestAnimationFrame(me._rafScopedLoop);
		else
			me.process = window.setInterval(me._scopedLoop, me.__fps);

		return this;
	},

	destroy: function()
	{
		if (this.process)
			window.clearInterval(this.process);

		this._rafScopedLoop = function() { };

		if (this.on_destroy)
			this.on_destroy();
	},

	/**
	 * Game Loop for requestAnimationFrame
	 */
	_rafGameLoop: function()
	{
		this.stage.draw();
		window.requestAnimationFrame(this._rafScopedLoop);
	},

	/**
	 * This is here to allow overriding by Debug.js
	 */
	_gameLoop: function()
	{
		this.stage.draw();
	},

	startFn: function() { },

	/**
	 * Starts Engine
	 */
	init: function j5g3Engine(config)
	{
	var
		me = this
	;
		if (typeof(config)==='function')
			config = { startFn: config };

		cache = j5g3.dom('CANVAS');

		me.fps(config.fps || me.__fps);

		if (config.fps)
			delete config.fps;

		j5g3.Class.apply(me, [ config ]);

		if (!this.stage)
			me.stage = new j5g3.Stage(this.stage_settings);

		me.startFn(j5g3, this);
	},

	/**
	 * Pauses game execution
	 */
	pause: function()
	{
		if (this.process)
		{
			window.clearInterval(this.process);
			window.cancelAnimationFrame(this.process);
		}
		this._rafScopedLoop = function() { };
	},

	/**
	 * Resume game execution.
	 */
	resume: function()
	{
		if (this.stage)
			this.stage.play();
	},


	/**
	 * Set the game Frames per Second.
	 */
	fps: function(val)
	{
		if (val===undefined)
			return 1000/this.__fps;

		this.__fps=1000/val;
		return this;
	},

	/**
	 * Creates a new ImageData object with width w and height h.
	 *
	 * @param {number} w id|Width. Defaults to screen canvas width.
	 *                   If its an id it will return the imagedata of that image.
	 * @param {number} h Height. Defaults to screen canvas height
	 */
	imagedata: function(w, h)
	{
	var
		img, ctx
	;
		switch(j5g3.get_type(w)) {
		case 'string':
			img = j5g3.id(w); break;
		case 'dom':
			img = w; break;
		case 'j5g3':
			img = w.source; break;
		}

		if (img)
		{
			cache.width = img.width;
			cache.height= img.height;
			ctx = cache.getContext('2d');
			ctx.drawImage(img, 0, 0);
			return ctx.getImageData(0, 0, img.width, img.height);
		}

		return this.stage.context.createImageData(
			w || this.stage.canvas.width, h || this.stage.canvas.height
		);
	}

});

/** @namespace j5g3 Easing algorithms */
j5g3.Easing= (function()
{
var
	E = {}, i, result = {},

	fnFactory = function(i, fn)
	{
		result['EaseIn' + i] = fn;
		result['EaseOut' + i] = function(p) { return 1 - fn(1-p); };
		result['EaseInOut' + i] = function(p) {
			return p < 0.5 ?
				fn( p * 2 ) / 2 :
				fn( p * -2 + 2 ) / -2 + 1;
		};
	}
;
	(['Quad', 'Cubic', 'Quart', 'Quint', 'Expo']).forEach(function(name, i) {
		E[name] = function(p) {
			return Math.pow(p, i+2);
		};
	});

	E.Sine = function (p) { return 1 - Math.cos( p * Math.PI / 2 ); };
	E.Circ = function (p) { return 1 - Math.sqrt( 1 - p * p ); };
	E.Elastic =  function(p) { return p === 0 || p === 1 ? p :
		-Math.pow(2, 8 * (p - 1)) * Math.sin(( (p - 1) * 80 - 7.5) * Math.PI / 15);
	};
	E.Back = function(p) { return p * p * ( 3 * p - 2 ); };
	E.Bounce = function (p) {
		var pow2, result,
		bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}

		result = 1 / Math.pow( 4, 3 - bounce ) - 7.5625 *
			Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );

		return result;
	};

	for (i in E)
		fnFactory(i, E[i]);

	result.Linear = function(p) { return p; };
	result.Swing = function(p) { return ( -Math.cos(p*Math.PI) / 2 ) + 0.5; };

	return result;
})();


// Shortcuts

/** 
 * @function
 * @return {j5g3.Action}
 */
j5g3.action = f(j5g3.Action);
/** @function 
 * @return {j5g3.Clip} */
j5g3.clip   = f(j5g3.Clip);
/** @function 
 * @return {j5g3.Image} */
j5g3.image  = f(j5g3.Image);
/** @function 
 * @return {j5g3.Sprite} */
j5g3.sprite = f(j5g3.Sprite);
/** @function 
 * @return {j5g3.Spritesheet} */
j5g3.spritesheet = f(j5g3.Spritesheet);
/** @function 
 * @return {j5g3.Text} */
j5g3.text   = f(j5g3.Text);

/**
 * Returns a Multiline Text object
 * @return {j5g3.Text}
 */
j5g3.mtext  = function(p) { var t = new j5g3.Text(p); t.paint = j5g3.Paint.MultilineText; return t; };
/** @function 
 * @return {j5g3.Matrix} */
j5g3.matrix = function(a, b, c, d ,e ,f) { return new j5g3.Matrix(a, b, c, d, e, f); };
/** @function 
 * @return {j5g3.Tween} */
j5g3.tween  = f(j5g3.Tween);
/** @function 
 * @return {j5g3.Emitter} */
j5g3.emitter= f(j5g3.Emitter);
/** @function 
 * @return {j5g3.Map} */
j5g3.map    = f(j5g3.Map);
/** @function 
 * @return {j5g3.Html} */
j5g3.html   = f(j5g3.Html);
/** @function 
 * @return {j5g3.Engine} */
j5g3.engine = f(j5g3.Engine);


// TODO This might not be a good idea.
window.CanvasGradient.prototype.at = function(offset, color)
{
	color = color || 'transparent';
	this.addColorStop(offset, color);
	return this;
};

})(this);


/**
 * @license Copyright 2010-2012, Giancarlo F Bellido.
 *
 * j5g3-loader v@VERSION - Javascript Library
 * http://j5g3.com
 *
 * j5g3 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * j5g3 is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with j5g3. If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: @DATE
 *
 */
(function(window, j5g3, undefined) {

/**
 * @class
 * @extend j5g3.Class
 * @requires j5g3-support.js
 */
j5g3.Loader = j5g3.Class.extend(/** @scope j5g3.Loader.prototype */{

	EVENT: {
		IMG: 'load',
		AUDIO: 'canplaythrough',
		SCRIPT: 'load'
	},

	sources: null,
	delay: 250,
	progress: 0,
	start: null,
	length: 0,

	on_progress: null,
	on_source: null,

	init: function j5g3Loader(p)
	{
		j5g3.Class.apply(this, [ p ]);

		this.sources = {};
		this.start = new Date();
	},

	_check_ready: function(callback)
	{
	var
		i, ready=0, length=0, me=this
	;
		for (i in this.sources)
		{
			length++;
			if (this.sources.hasOwnProperty(i) && this.sources[i].ready)
				ready++;
		}

		this.progress = ready ? (ready/length) : 0;

		if (this.on_progress)
			this.on_progress(this.progress);

		if (length===ready)
		{
			if (callback) callback();
		}
		else
			this._timeout = window.setTimeout(function() { me._check_ready(callback); }, this.delay);
	},

	el: function(tag, src)
	{
	var
		me = this,
		result = this.sources[src], source
	;
		if (!result)
		{
			result = j5g3.dom(tag);
			this.sources[src] = source = { el: result };

			result.addEventListener(this.EVENT[tag], function() {
				source.ready = true;
				if (me.on_source)
					me.on_source(source);
			}, false);

			result.setAttribute('src', src);

			this.length++;
		}

		return result;
	},

	img: function(src)
	{
		return this.el('IMG', src);
	},

	audio: function(src)
	{
	var
		ext = src.split('.').pop()
	;
		if (!j5g3.support.audio[ext])
			src = src.replace(
				new RegExp("\\."+ext+'$'),
				'.' + j5g3.support.audio.default
			);
		return this.el('AUDIO', src);
	},

	script: function(src)
	{
	var
		result = this.el('SCRIPT', src)
	;
		window.document.head.appendChild(result);
		return result;
	},

	ready: function(callback)
	{
		this._check_ready(callback);
	},

	destroy: function()
	{
		window.clearTimeout(this._timeout);
	}

});

j5g3.loader = j5g3.factory(j5g3.Loader);

})(this, this.j5g3);

/**
 * j5g3 v0.9.0 - Javascript Physics Engine
 * http://
 *
 * Copyright 2010-2012, Giancarlo F Bellido
 *
 * j5g3 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * j5g3 is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with j5g3. If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: 2013-04-05 12:06:30 -0400
 *
 */
(function(j5g3, undefined) {
'use strict';

/**
 * Collision Object.
 */
j5g3.Collision = j5g3.Class.extend({

	/** Object querying the collition */
	A: null,
	/** Object colliding with */
	B: null,

	/** Collision Normal X component */
	nx: 0,
	/** Collision Normal Y component */
	ny: 0,
	/** Penetration */
	penetration: 0,
	/** Number of contacts */
	length: 0,

	/** Distance of midpoints */
	tx: 0,
	/** Distance of midpoints */
	ty: 0,

	'0': null,
	'1': null,
	'2': null,
	'3': null,
	'4': null,
	'5': null,
	'6': null,

	init: function j5g3Collision(p)
	{
		if (p)
			this.extend(p);
	}

});

/**
 * @namespace
 * Collision detection algorithms. These algorithms return a Collision object if successful.
 */
j5g3.CollisionQuery = {

	/**
	 * Circle Collision
	 */
	Circle: function(obj)
	{
	var
		r = this.radius + obj.radius,
		dx= this.x - obj.x,
		dy= this.y - obj.y
	;
		if (r*r > (dx*dx + dy*dy))
			return { nx: dx, ny: dy };
	},

	_AABB: function(obj)
	{
	var
		r1 = this.x + this.width,
		r2 = obj.x + obj.width,
		b1 = this.y + this.height,
		b2 = obj.y + obj.height,
		tx, ty,
		coll = this.collision
	;
		coll.collides = !(obj.x >= r1 || r2 <= this.x || obj.y >= b1 || b2 <= this.y);

		if (coll.collides)
		{
			coll.B = obj;
			tx = coll.tx = (obj.x+obj.width/2) - (this.x+this.width/2);
			ty = coll.ty = (obj.y+obj.height/2) - (this.y+this.height/2);

			coll[0] = Math.max(this.x, obj.x);
			coll[1] = Math.max(this.y, obj.y);
			coll[2] = Math.min(r1, r2);
			coll[3] = Math.min(b1, b2);

			if (coll[2]-coll[0] < coll[3]-coll[1])
			{
				coll.nx = tx < 0 ? -1 : 1;
				coll.ny = 0;
				coll.penetration = tx<0 ? coll[2]-this.x: r1-coll[0];
			} else
			{
				coll.ny = ty < 0 ? -1 : 1;
				coll.nx = 0;
				coll.penetration = ty<0 ? coll[3]-this.y : b1-coll[1];
			}

			return this.collision;
		}
	},

	/**
	 * AABB collision algorithm.
	 * TODO apply transformations
	 */
	AABB: function(obj)
	{
		this.collision = new j5g3.Collision({ length: 2, A: this });
		this.collides = j5g3.CollisionQuery._AABB;

		return this.collides(obj);
	}

};

/**
 * @namespace
 * Collision Tests return true or false
 */
j5g3.CollisionTest = {

	AABB: function(obj)
	{
	var
		r1 = this.x + this.width,
		b1 = this.y + this.height,
		r2 = obj.x + obj.width,
		b2 = obj.y + obj.height
	;

		return !(obj.x > r1 || r2 < this.x || obj.y > b1 || b2 < this.y);
	},

	Container: function(obj)
	{
	var
		frame = this.frame,
		prev = frame,
		result = false,
		// TODO Translate obj coordinates to local
		tobj = {
			x: obj.x - this.x, y: obj.y - this.y,
			width: obj.width, height: obj.height
		}
	;
		while ((prev = prev.previous)!==frame)
			if ((result = prev.collides && prev.collides(tobj)))
				break;

		return result;
	}
};

/**
 * Tests if object collides with another object obj. See j5g3.Collision for available
 * algorithms.
 *
 * @param {j5g3.DisplayObject} obj
 * @return {boolean}
 */
j5g3.DisplayObject.prototype.collides = j5g3.CollisionTest.AABB;

j5g3.Clip.prototype.collides = j5g3.CollisionTest.Container;

})(this.j5g3);

/**
 * j5g3 v0.9.0 - Javascript Graphics Engine
 * http://j5g3.com
 *
 * Copyright 2010-2012, Giancarlo F Bellido
 *
 * j5g3 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * j5g3 is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with j5g3. If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: 2013-04-05 12:06:30 -0400
 *
 */
(function(j5g3, undefined) {
'use strict';

/**
 *
 * j5g3.Shape
 *
 * Base class for all shapes.
 *
 * @class
 * @extends j5g3.DisplayObject
 *
 */
j5g3.Shape = j5g3.DisplayObject.extend(
/** @scope j5g3.Shape.prototype */ {

	/**
	 * Type of shape for collision handling.
	 * 'circle', 'segment', 'polygon'
	 */
	shape: null,

	/**
	 * Red value for fill attribute. Make sure to set all three for
	 * colors to work. 0 to 255.
	 */
	red: undefined,

	/**
	 * Green value for fill attribute. Make sure to set all three for
	 * colors to work. 0 to 255.
	 */
	green: undefined,

	/**
	 * Blue value for fill attribute. Make sure to set all three for
	 * colors to work. 0 to 255.
	 */
	blue: undefined,

	/**
	 * Property affected by the red,green and blue properties.
	 */
	color_property: 'fill',

	/* Old values */
	_red: undefined,
	_green: undefined,
	_blue: undefined,

	init: function j5g3Shape(p)
	{
		j5g3.DisplayObject.apply(this, [p]);
	},

	_begin: j5g3.DisplayObject.prototype.begin,

	begin: function(context)
	{
		var me = this;

		if (me.red!==me._red || me.blue!==me._blue || me.green!==me._green)
		{
			// TODO this is ridiculous and slow.
			me[me.color_property] = 'rgb(' + Math.floor(me.red) + ',' +
				Math.floor(me.green) + ',' +
				Math.floor(me.blue) + ')'
			;
			me._red = me._red;
			me._green = me.green;
			me._blue = me.blue;
		}

		this._begin(context);

	},

	paintPath: function()
	{
	},

	paint: function(context)
	{
		context.beginPath();
		this.paintPath(context);

		context.closePath();
		context.fill();
		context.stroke();
	}

});

/**
 * Draws a circle
 * @class
 * @extend j5g3.Shape
 */
j5g3.Circle = j5g3.Shape.extend(/**@scope j5g3.Circle.prototype */ {

	shape: 'circle',
	radius: 0,

	get width() { return 2 * (this.M.x(this.radius, 0) - this.x); },
	get height() { return 2 * (this.M.y(0, this.radius) - this.y); },

	init: function j5g3Circle(p)
	{
		j5g3.Shape.apply(this, [ p ]);
	},

	paintPath: function(context)
	{
		// TODO Optimize
		context.arc(this.cx, this.cy, this.radius, 0, 2*Math.PI, false);
	},

	at: j5g3.HitTest.Circle
});

/**
 * Draws a line
 * @class
 * @extend j5g3.Shape
 */
j5g3.Line = j5g3.Shape.extend(/**@scope j5g3.Line.prototype */{

	x2: 0,
	y2: 0,

	paintPath: function(context)
	{
		context.moveTo(this.cx, this.cy);
		context.lineTo(this.x2, this.y2);
	}

});

/**
 * Polygon Class
 * @class
 * @extend j5g3.Shape
 */
j5g3.Polygon = j5g3.Shape.extend(/**@scope j5g3.Polygon.prototype */{

	shape: 'polygon',
	points: null,
	normals: null,

	init: function j5g3Polygon(p)
	{
		j5g3.Shape.apply(this, [p]);

		if (this.points===null)
			this.points = [];
		if (this.normals===null)
			this.calculate_normals();
	},

	normalize: function(point)
	{
	var
		mag = Math.sqrt(point[0]*point[0] + point[1]*point[1])
	;
		point[0] = point[0]/mag;
		point[1] = point[1]/mag;

		return point;
	},

	calculate_normals: function()
	{
	var
		i=0, a, points = this.points, l=points.length,
		normals = [], point = [0.0,0.0]
	;
		for (; i<l; i+=2)
		{
			a = i+2 < l ? i+2 : 0;
			point[0] = points[a] - points[i];
			point[1] = points[a+1] - points[i+1];
			this.normalize(point);

			normals.push(point[1], -point[0]);
		}

		this.normals = normals;
	},

	paintPath: function(context)
	{
	var
		i = 2,
		P = this.points,
		l = P.length
	;
		context.moveTo(P[0], P[1]);
		for (; i<l; i+=2)
			context.lineTo(P[i], P[i+1]);
	},

	at: j5g3.HitTest.Polygon

}, /** @scope Polygon */{
	/**
	 * Creates a polygon based on number of sides.
	 */
	create: function(sides, p)
	{
	var
		angle = Math.PI*2/sides,
		a = angle
	;
		p.points = [];

		while (sides--)
		{
			p.points.push(Math.cos(a)*p.radius, Math.sin(a)*p.radius);
			a += angle;
		}

		return new j5g3.Polygon(p);
	}

});

/**
 *
 * Displays a Rect
 *
 * @class
 * @extends j5g3.Shape
 *
 */
j5g3.Rect = j5g3.Shape.extend(/**@scope j5g3.Rect.prototype */{

	shape: 'polygon',

	init: function j5g3Rect(p)
	{
		j5g3.Shape.apply(this, [p]);
		if (this.width===null)
		{
			this.height = this.width = this.radius*2;
		}
	},

	paint : function(context)
	{
		context.fillRect(this.cx, this.cy, this.width, this.height);
		context.strokeRect(this.cx, this.cy, this.width, this.height);
	}

});

/**
 * Displays a Dot
 *
 * @class
 * @extends j5g3.Shape
 */
j5g3.Dot = j5g3.Shape.extend(/**@scope j5g3.Dot.prototype */{

	shape: 'circle',
	line_cap: 'round',
	line_join: 'round',
	color_property: 'stroke',

	/**
	 * p can be properties or line_width
	 */
	init: function j5g3Dot(p)
	{
		if (typeof(p) === 'number' )
			p = { line_width: p };

		j5g3.Shape.apply(this, [p]);
	},

	paint: function(context)
	{
		context.strokeRect(0, 0, 1, 1);
	}

});

/** @function 
 * @return {j5g3.Polygon} */
j5g3.polygon= j5g3.factory(j5g3.Polygon);
/** @function 
 * @return {j5g3.Circle} */
j5g3.circle = j5g3.factory(j5g3.Circle);
/** @function 
 * @return {j5g3.Line} */
j5g3.line   = j5g3.factory(j5g3.Line);
/** @function 
 * @return {j5g3.Dot} */
j5g3.dot    = j5g3.factory(j5g3.Dot);
/** @function 
 * @return {j5g3.Rect} */
j5g3.rect   = j5g3.factory(j5g3.Rect);

})(this.j5g3);

/**
 * Copyright 2010-2013, Giancarlo F Bellido.
 *
 * j5g3 v0.9.0 - Javascript Library
 * http://j5g3.com
 *
 * j5g3 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * j5g3 is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with j5g3. If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: 2013-04-05 12:06:30 -0400
 *
 */
(function(window, j5g3) {
'use strict';

var
	audioEl = j5g3.dom('audio')
;

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback)
			{
				return window.setTimeout(callback, 1000/60);
			};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = window.mozCancelAnimationFrame ||
			window.msCancelAnimationFrame ||
			function(id)
			{
				window.clearTimeout(id);
			};

	/**
	 * J5G3 Browser Capabilities module. Includes polyfills for features
	 * used by the engine.
	 * @namespace
	 */
	j5g3.support = {
		audio: {}
	};

	if (audioEl && audioEl.canPlayType)
	{
		/** Lists supported audio types */
		j5g3.support.audio = {
			/** Audio tag supports mp3 */
			mp3: audioEl.canPlayType('audio/mpeg'),
			/** Audio tag supports ogg */
			ogg: audioEl.canPlayType('audio/ogg'),
			/** Audio tag supports mp4 */
			mp4: audioEl.canPlayType('audio/mp4'),
			/** Audio tag supports wav files */
			wav: audioEl.canPlayType('audio/wav')
		};

		// TODO There is probably a better way to do this
		for (var i in j5g3.support.audio)
			if (j5g3.support.audio[i])
			{
				j5g3.support.audio.default = i;
				break;
			}
	}

})(this, this.j5g3);
