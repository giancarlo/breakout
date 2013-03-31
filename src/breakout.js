
var
	WIDTH = 320,
	HEIGHT = 416,
	BOUNDS = { left: 16, top: 16, right: WIDTH-32, bottom: HEIGHT },

	loader = j5g3.loader(),
	canvas, 
	
	assets = {
		tiles: loader.img('tiles.png'),
		bg: loader.img('bg_prerendered.png'),
		logo: loader.img('logo.png'),

		sound: {
			brickDeath: loader.audio('brickDeath.wav'),
			countdownBlip: loader.audio('countdownBlip.wav'),
			powerdown: loader.audio('powerdown.wav'),
			powerup: loader.audio('powerup.wav'),
			recover: loader.audio('recover.wav')
		}
	},

	/* scenes */
	Intro = j5g3.Clip.extend({ 
		alpha: 0,

		setup: function(p)
		{
			this.add([
				assets.bg,
				j5g3.image(assets.logo).pos(95, 50),
				j5g3.text({ text: 'Click to start', x: 100, y: 280, font: '20px Arial' })
			]);
		}
	}), 

	Level = j5g3.Clip.extend({ 
		alpha: 0,

		on_mouse: function(ev)
		{
		var
			xi = this.pad.x
		;
			this.pad.x = ev.layerX > this.pad.maxx ? this.pad.maxx : ev.layerX;
			this.pad.vx = (this.pad.x-xi)/3;
		},

		update: function()
		{
		var
			ball = this.ball,
			coll = this.pad.collides(ball)
		;
			if (coll)
			{
				if (coll.ny)
					ball.vy = coll.ny*Math.abs(ball.vy); 

				ball.vx = ball.vx + coll.nx * 2 * Math.abs(ball.vx) + this.pad.vx;

				ball.y += coll.ny * coll.penetration;
				ball.x += coll.nx * coll.penetration;
			} 
			else if (ball.x > BOUNDS.right)
			{
				ball.x = BOUNDS.right;
				ball.vx = -ball.vx;
			}
			else if (ball.x < BOUNDS.left)
			{
				ball.x = BOUNDS.left;
				ball.vx = -ball.vx;
			} else if (ball.y < BOUNDS.top)
			{
				ball.y = BOUNDS.top;
				ball.vy = -ball.vy;
			} else if (ball.y > BOUNDS.bottom)
			{
				this.lost();
			}

			ball.x += ball.vx;
			ball.y += ball.vy;
		},

		lost: function()
		{
		var
			score = this.score.lives.text = parseInt(this.score.lives.text)-1
		;
			if (score===0)
				this.game_over();
			else
				this.reset();
		},

		game_over: function()
		{
			this.stop();
		},

		do_count: function()
		{
			this.count = new Count({ 
				x: 146, y: 200,
				on_remove: this.start_game.bind(this)
			});
			this.add(this.count);
		},

		reset: function()
		{
			this._update.remove();
			this.ball.pos(80, 240);
			this.ball.vx = this.ball.vy = 2;
			this.do_count();
		},

		setup: function()
		{
			this.pad = new Pad({ x: 130, y: 368 });
			this.score = new Score({ x: 20, y: 405 });
			this.ball = new Ball({ x: 80, y: 240 });
			this._update = new j5g3.Action(this.update.bind(this));

			this.add([ assets.bg, this.pad, this.ball, this.score ]);
		},

		start_game: function()
		{
			this._on_mouse = this.on_mouse.bind(this);
			this.add(this._update);

			canvas.addEventListener('mousemove', this._on_mouse );
		},

		start: function()
		{
			this.do_count();
		},

		destroy: function()
		{
			canvas.removeEventListener('mousemove', this._on_mouse);
		}

	}),

	Count = j5g3.Clip.extend({
		
		setup: function()
		{
		var
			me = this,
			fn = function(clip, on_remove)
			{
				me.add([ 
					clip, 
					j5g3.tween({ 
						target: clip, to: { sx: 1, sy: 1 },
						duration: 30, 
						easing: j5g3.fx.Easing.EaseOutElastic,
						auto_remove: true,
						on_remove: function() {
							clip.remove();
							on_remove && on_remove();
						}
					})
				]);
			}
		;
			this.one = game.spritesheet.cut(0, 96, 32, 48).scale(0, 0);
			this.two = game.spritesheet.cut(32,96, 32, 48).scale(0, 0);
			this.three = game.spritesheet.cut(64, 96, 32, 48).scale(0, 0);

			fn(me.one, function() { 
				assets.sound.countdownBlip.play();
				fn(me.two, function() { 
					assets.sound.countdownBlip.play();
					fn(me.three, function() {
						assets.sound.countdownBlip.play();
						me.remove();
						me.on_remove();
					}); 
				}); 
			});
		}

	}),

	Ball = j5g3.Clip.extend({

		vx: 2,
		vy: 2,
		width: 16,
		height: 16,

		setup: function()
		{
			this.add(game.spritesheet.cut(48, 64, 16, 16));
			this.add_frame(game.spritesheet.cut(64, 64, 16, 16));
			this.add_frame(game.spritesheet.cut(80, 64, 16, 16));
			this.add_frame(game.spritesheet.cut(96, 64, 16, 16));
			this.add_frame(game.spritesheet.cut(112, 64, 16, 16));
		}

	}),

	/* Elements */
	Pad = j5g3.Clip.extend({

		height: 16,
		width: 48,
		vx: 0,
		// Use more precise collision
		collides: j5g3.CollisionQuery.AABB,

		make_small: function()
		{
			this.go(1);
			this.width = 32;
			this.maxx = WIDTH-this.width;
		},
		
		setup: function()
		{
			this.add([ game.spritesheet.cut(0, 64, 48, 16) ]);
			this.add_frame([ game.spritesheet.cut(0, 80, 32, 16) ]);

			this.maxx = WIDTH-this.width;

			this.stop().go(0);
		}

	}),

	Score = j5g3.Clip.extend({

		setup: function()
		{
			this.font = '18px Arial';
			this.lives = j5g3.text({ text: 3, x: 60 });
			this.score = j5g3.text({ text: 0, x: 160 });
			this.level = j5g3.text({ text: 1, x: 260 });

			this.add([ 
				j5g3.text({ text: 'Lives: ' }),
				this.lives, 
				j5g3.text({ text: 'Score: ', x: 100 }),
				this.score, 
				j5g3.text({ text: 'Level: ', x: 200 }),
				this.level 
			]);
				
		}

	}),

	/* Initialize Game */
	Breakout = j5g3.Engine.extend({

		spritesheet: null,

		use_animation_frame: true,

		start_count: function()
		{
			this.intro.remove();
			this.level.start();
		},

		start_level: function(ev)
		{
			this.level = new Level();

			this.stage.add([ 
				this.level,
				j5g3.tween({ target: this.intro, to: { alpha: 0 }, auto_remove: true, duration: 30 }),
				j5g3.tween({ 
					target: this.level, to: { alpha: 1 }, 
					duration: 30,
					auto_remove: true, 
					on_remove: this.start_count.bind(this)
				})
			]);

			this.stage.un('click', this.start_level);
		},
	
		startFn: function()
		{
			this.spritesheet = j5g3.spritesheet(assets.tiles);
			this.intro = new Intro();

			this.stage.add([ 
				this.intro, 
				j5g3.tween({ 
					target: this.intro, 
					to: { alpha: 1 }, 
					auto_remove: true, 
					duration: 30 
				})
			]);

			this.stage.on('click', this.start_level, this);
			this.run();
		}
	}),

	game
;

	loader.ready(function()
	{
		canvas = j5g3.dom('CANVAS');
		canvas.setAttribute('width', WIDTH);
		canvas.setAttribute('height', HEIGHT);

		document.body.appendChild(canvas);

		game = new Breakout({ stage_settings: { canvas: canvas }});
	});
