
var
	WIDTH = 320,
	HEIGHT = 416,
	BOUNDS = { left: 16, top: 16, right: WIDTH-32, bottom: HEIGHT },
	MAXV = 4,

	LEVELS = [
		[ [0,0,1,2,1,0,0], [2,3,1,1,1,3,2], [0,3,3,3,3,3,0 ]],
		[ [0,1,2,1,2,1,0], [0,4,4,4,4,4,0], [1,4,3,4,3,4,1], [1,4,4,4,4,4,1], [1,4,0,0,0,4,1], [0,4,4,4,4,4,0] ],
		[ [0,1,0,2,0,1,0], [1,0,1,3,1,0,1], [1,2,1,3,1,2,1], [1,0,1,3,1,0,1], [0,1,0,0,0,1,0], [4,0,4,0,4,0,4] ],
		[ [1,2,3,4,3,2,1], [4,0,0,0,0,0,0], [3,0,3,4,1,2,3], [2,0,2,0,0,0,4], [1,0,1,0,1,0,1], [4,0,4,3,2,0,2], [2,1,4,3,2,1,4]]
	],

	loader = j5g3.loader(),

	assets = {
		tiles: loader.img('src/tiles.png'),
		bg: loader.img('src/bg_prerendered.png'),
		logo: loader.img('src/logo.png'),

		sound: {
			brickDeath: loader.audio('src/brickDeath.mp3'),
			countdownBlip: loader.audio('src/countdownBlip.mp3'),
			powerdown: loader.audio('src/powerdown.mp3'),
			powerup: loader.audio('src/powerup.mp3'),
			recover: loader.audio('src/recover.mp3')
		}
	},

	fade = function(obj, a, cb) {
		return j5g3.tween({
			target: obj,
			to: { alpha: a },
			auto_remove: true,
			duration: 30,
			on_remove: cb
		});
	},

	/* scenes */
	Intro = j5g3.Clip.extend({

		alpha: 0,

		setup: function()
		{
			this.add([
				assets.bg,
				j5g3.image(assets.logo).pos(95, 50),
				j5g3.text({ text: 'Click to start', x: 100, y: 280, font: '20px Arial' }),
				fade(this, 1)
			]);

			this.input = j5g3.in({ element: game.stage.canvas, buttonY: game.start_level.bind(game) });
		},

		remove: function()
		{
			this.add(fade(this, 0, function() {
				j5g3.Clip.prototype.remove.apply(this.parent);
			}));

			this.input.destroy();
		}

	}),

	Plus = j5g3.Clip.extend({

		// Spritesheet X pos
		sX: 96,
		// Spritesheet Y pos
		sY: 96,

		on_collide: function()
		{
			// add another ball
			game.level.balls.add(new Ball());
			this.remove();
		},

		update_frame: function()
		{
			this.y++;

			if (this.collides(game.level.pad))
				this.on_collide();

			if (this.y>BOUNDS.bottom)
				this.remove();
		},

		setup: function()
		{
			this.add([
				game.spritesheet.cut(this.sX, this.sY, 16, 16)
			]);
		}

	}),

	Minus = Plus.extend({

		sX: 112,

		on_collide: function()
		{
			game.level.pad.make_small();
			this.remove();
		}

	}),

	Blocks = j5g3.Clip.extend({

		level: 0,
		blocks: null,
		collides: j5g3.CollisionTest.AABB,

		load_level: function(level)
		{
		var
			block, x, y
		;
			this.level = level || 0;
			level = LEVELS[this.level];

			for (y=0; y<level.length; y++)
				for (x=0; x<level[y].length; x++)
				{
					if (level[y][x])
					{
						block = this.blocks[level[y][x]];
						block = game.spritesheet.clip(block)
							.add_frame(this.remove_block)
							.go(0)
							.pos(x*32, y*16)
							.stop()
						;
						block.collides = j5g3.CollisionQuery.AABB;

						this.add(block);
					}
				}

			this.width = level[0].length*32;
			this.height = level.length*16;
		},

		remove_block: function()
		{
		var
			me = this.parent,
			mod = ({ 1: Plus, 2: Minus })[j5g3.irand(4)]
		;
			if (mod)
				game.level.mods.add(new mod({
					x: me.x+8 + me.parent.x,
					y: me.y+16 + me.parent.y
				}));

			me.remove();
		},

		setup: function()
		{
			this.blocks = {
				0: false,
				1: [ 0, 1, 2, 3, 4 ],
				2: [ 6, 7, 8, 9, 10],
				3: [ 12, 13, 14, 15, 16 ],
				4: [ 18, 19, 20, 21, 22 ]
			};
		}

	}),

	Level = j5g3.Clip.extend({
		alpha: 0,

		on_mouse: function(ev)
		{
		var
			xi = this.pad.x
		;
			this.pad.x = this.input.x> this.pad.maxx ? this.pad.maxx : this.input.x;
			this.pad.vx = (this.pad.x-xi)/3;
		},

		update_frame: function()
		{
			if (this.input)
				this.pad.vx = 0;
		},

		lost: function()
		{
			if (!this.balls.is_frame_empty())
				return;

		var
			score = this.score.lives.text = parseInt(this.score.lives.text, 10)-1
		;

			if (score===0)
				this.game_over();
			else
				this.reset();
		},

		won: function()
		{
			if (!LEVELS[this.blocks.level+1])
				this.game_over();
			else
			{
				this.blocks.load_level(this.blocks.level+1);
				this.score.level.text = this.blocks.level+1;
				this.score.add_score(100);
				this.reset();
			}
		},

		game_over: function()
		{
			this.remove();
			game.start();
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
			this.mods.remove();
			this.balls.remove();

			this.pad.make_big(false);
			this.do_count();
		},

		setup: function()
		{
			this.pad = new Pad({ x: 130, y: 368 });
			this.score = new Score({ x: 20, y: 395 });
			this.blocks = new Blocks({ x: 60, y: 70 });
			this.blocks.load_level();

			this.add([
				assets.bg, this.pad, this.blocks, this.score,
				j5g3.tween({
					target: this, to: { alpha: 1 },
					duration: 30,
					auto_remove: true,
					on_remove: this.start.bind(this)
				})
			]);
		},

		start_game: function()
		{
			this.add([
				this.mods = j5g3.clip(),
				this.balls = j5g3.clip()
			]);

			this.balls.add(new Ball());

			this.input = j5g3.in({ element: game.stage.canvas });
			this.input.move = this.on_mouse.bind(this);
		},

		start: function()
		{
			this.do_count();
		},

		remove: function()
		{
			j5g3.Clip.prototype.remove.apply(this);
			this.input.destroy();
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
						easing: j5g3.Easing.EaseOutElastic,
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

		vx: 3,
		vy: 3,
		width: 16,
		height: 16,
		x: 80,
		y: 240,

		update_frame: function()
		{
		var
			ball = this,
			blocks = game.level.blocks,
			pad = game.level.pad,
			coll = pad.collides(ball),
			result
		;

			if (coll)
			{
				if (coll.ny)
					ball.vy = coll.ny*Math.abs(ball.vy);

				ball.vx = ball.vx + coll.nx * 2 * Math.abs(ball.vx) + pad.vx;

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
				this.remove();
				game.level.lost();
			} else if (blocks.collides(ball))
			{
				if ((result = j5g3.CollisionTest.Container.apply(blocks, [ ball ])))
				{
					if (result.ny)
						ball.vy = result.ny*Math.abs(ball.vy);

					ball.vx = ball.vx + result.nx * 2 * Math.abs(ball.vx);
					result.A.play();
					assets.sound.brickDeath.play();
					game.level.score.add_score(10);
				}
			} else if (blocks.is_frame_empty())
			{
				game.level.won();
			}

			if (ball.vx>MAXV) ball.vx = MAXV;
			if (ball.vy>MAXV) ball.vy = MAXV;

			ball.x += ball.vx;
			ball.y += ball.vy;
		},

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

		make_big: function(sound)
		{
			if (sound !== false)
				assets.sound.powerup.play();

			this.go(0);
			this.width = 48;
			this.maxx = WIDTH-this.width;
		},

		make_small: function()
		{
			assets.sound.powerdown.play();
			this.go(1);
			this.width = 32;
			this.maxx = WIDTH-this.width;

			if (!this._smallTimer)
				this.add(function() {
					if (this.parent._smallTimer-- === 0)
					{
						this.parent.make_big();
						this.remove();
					}
				});

			this._smallTimer = 300;
		},

		setup: function()
		{
			this.add(game.spritesheet.cut(0, 64, 48, 16));
			this.add_frame(game.spritesheet.cut(0, 80, 32, 16));

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

		},

		add_score: function(val)
		{
			this.score.text = parseInt(this.score.text, 10) + val;
		}

	}),

	/* Initialize Game */
	Breakout = j5g3.Engine.extend({

		spritesheet: null,

		use_animation_frame: true,

		start_level: function(ev)
		{
			this.intro.remove();
			this.level = new Level();
			this.stage.add(this.level);
		},

		start: function()
		{
			this.intro = new Intro();
			this.stage.add(this.intro);
			this.spritesheet = j5g3.spritesheet(assets.tiles).grid(6, 9);
		},

		startFn: function()
		{
			this.stage.add(new Loading());
			this.run();
		}
	}),

	Loading = j5g3.Clip.extend({

		update_frame: function()
		{
			this.count.text = loader.progress;
		},

		setup: function()
		{
		var
			me = this
		;
			me.fill = '#eee';
			me.count = j5g3.text({
				text: '0%', font: '40px serif', x: 80, y: 160
			});

			me.add([
				j5g3.text({ text: 'Loading...', font: '20px serif', x: 50, y: 100 }),
				me.count
			]);

			loader.ready(function()
			{
				me.remove();
				game.start();
			});
		}

	}),

	game
;

	game = new Breakout({
		fps: 60,
		stage_settings: {
			width: WIDTH, height: HEIGHT
		}
	});

