uniform sampler2D texture;
uniform vec2 texSize;
uniform vec3 camPos;
uniform int tick;
uniform sampler2D skyboxTex;
uniform float angleCamX;
uniform float angleCamY;
uniform vec3 camDir;

/// CONSTS ///

#define PI 3.14

#define POS_INF 1.0/0.0

#define O_NONE 0
#define O_PLANE 1
#define O_SPHERE 2


#define SPHERES_NB 20

/// STRUCTS ///

struct Ray
{
	vec3 pos;
	vec3 dir;
	vec3 energy;
};
Ray create_ray(vec3 pos_, vec3 dir_)
{
	Ray ray;
	ray.pos = pos_;
	ray.dir = dir_;
	ray.energy = vec3(1);
	return ray;
}

struct LInfo
{
	bool affectedByShadow;
	vec3 albedo;
	vec3 specular;
	bool isCheckerBoard;
};

struct Hit
{
	vec3 pos;
	float dist;
	vec3 normal;
	int oType;
	LInfo info;
};
Hit create_hit()
{
	Hit hit;
	hit.pos = vec3(0);
	hit.dist = POS_INF;
	hit.normal = vec3(0);
	hit.oType = O_NONE;
	return hit;
}

vec3 lightPos = vec3(100, 100, 100);

struct Sphere
{
	vec3 pos;
	float radius;
	LInfo info;
};

struct Plane
{
	LInfo info;
};


struct ShadeResult
{
	vec3 color;
	Ray ray;
	bool inShadow;
	bool hitSky;
};

Sphere spheres[SPHERES_NB] = Sphere[SPHERES_NB](
			Sphere(vec3(-0.5058006476699359, 0.5142125630084572 + abs(cos(tick/15.0396583921099+75.80432330397943))*0.5142125630084572, -0.9780367359091559), 0.5142125630084572, LInfo(true, vec3(0.9985303541665068, 0.16192377606323372, 0.7842753127816726), vec3(0.43255690374462863, 0.8876652871650895, 0.21943710008627682), false)),
			Sphere(vec3(-1.8949507223747513, 1.8043484522678221 + abs(cos(tick/160.9177989153434+105.99518440919503))*1.8043484522678221, 2.0242792225614297), 1.8043484522678221, LInfo(true, vec3(0.860695751556879, 0.8986066612156174, 0.4070796263097458), vec3(0.05767891608081166, 0.900976250124936, 0.97088071231716), false)),
			Sphere(vec3(1.5178671329488873, 0.40161684139892906 + abs(cos(tick/56.957156796153185+237.4898972084677))*0.40161684139892906, 1.5320349478466344), 0.40161684139892906, LInfo(true, vec3(0.5183971371799513, 0.07803646723165225, 0.44757664573051403), vec3(0.5324428769506032, 0.9549496998138554, 0.16531909158358415), false)),
			Sphere(vec3(0.0996124336179872, 0.8966997997979254 + abs(cos(tick/37.58832934304381+79.45092095010536))*0.8966997997979254, 4.459081975678241), 0.8966997997979254, LInfo(true, vec3(0.3674462048000655, 0.1448014109675697, 0.522140003315562), vec3(0.03732931269387074, 0.11414694261020031, 0.41393905338809955), false)),
			Sphere(vec3(3.661611383749171, 1.9564395594593773 + abs(cos(tick/179.50455253273628+190.87482288782786))*1.9564395594593773, 3.0210226266435387), 1.9564395594593773, LInfo(true, vec3(0.5714088253426026, 0.20395539145688246, 0.5803932912045007), vec3(0.9189661037512846, 0.7271288412836197, 0.7530630828863588), false)),
			Sphere(vec3(-4.497669627637035, 0.6308080305462894 + abs(cos(tick/129.622582654563+48.08842335317257))*0.6308080305462894, 1.3649735286800015), 0.6308080305462894, LInfo(true, vec3(0.41647871428001526, 0.17316648080819552, 0.49097051976265016), vec3(0.7301254710078242, 0.9339805370656753, 0.5319945217935297), false)),
			Sphere(vec3(0.5984418023169744, 0.6184113917486072 + abs(cos(tick/78.20121610725093+160.21742418161443))*0.6184113917486072, 0.7420903916267243), 0.6184113917486072, LInfo(true, vec3(0.3776096359464517, 0.4833842913373976, 0.34723239248012017), vec3(0.5830657210587391, 0.5066908258935439, 0.7169217244959222), false)),
			Sphere(vec3(-0.015462166628375918, 1.4422018566887744 + abs(cos(tick/22.8207755239074+93.85255178076841))*1.4422018566887744, -4.849412420266576), 1.4422018566887744, LInfo(true, vec3(0.27955522650105924, 0.16875352294925372, 0.7173869209278628), vec3(0.5938785722270908, 0.8405033747843706, 0.3120373059826622), false)),
			Sphere(vec3(1.5165814055656688, 0.7791119464218966 + abs(cos(tick/199.85221632996615+82.70379606163272))*0.7791119464218966, -2.0485595955442437), 0.7791119464218966, LInfo(true, vec3(0.17590681161304433, 0.7391548816840213, 0.3911851380825392), vec3(0.3731764876606797, 0.17780610515894335, 0.3124283859154069), false)),
			Sphere(vec3(-3.709321022302212, 0.10379064939265902 + abs(cos(tick/107.27776725697234+152.94305156229763))*0.10379064939265902, 0.931104460707148), 0.10379064939265902, LInfo(true, vec3(0.294855332912927, 0.4008110147555256, 0.396457547825139), vec3(0.36857592565344366, 0.3820903665068094, 0.6938921122883356), false)),
			Sphere(vec3(0.7396920914974727, 0.1308331367558385 + abs(cos(tick/52.28944636825747+21.471086309324527))*0.1308331367558385, -1.040431629442048), 0.1308331367558385, LInfo(true, vec3(0.1446027954510788, 0.6866364060380408, 0.10499861232523378), vec3(0.8135029090514884, 0.7652135264473165, 0.1312009351195237), false)),
			Sphere(vec3(-0.31110687920894836, 0.23904513429983623 + abs(cos(tick/144.8872024317563+12.19475797598446))*0.23904513429983623, 0.45274077912759275), 0.23904513429983623, LInfo(true, vec3(0.9240283103798677, 0.4469533264751411, 0.09937704590609386), vec3(0.03674556960477304, 0.5879506853982277, 0.5295397570514323), false)),
			Sphere(vec3(-0.985601554617266, 0.4690057592054562 + abs(cos(tick/110.65064929521358+182.80095351095383))*0.4690057592054562, -2.9991065442543965), 0.4690057592054562, LInfo(true, vec3(0.4331349688892665, 0.6357830396005791, 0.9694286146925531), vec3(0.2624831480403528, 0.03931869248087205, 0.2480876336383564), false)),
			Sphere(vec3(-3.05086153586427, 0.6164752278747426 + abs(cos(tick/48.05490599572886+84.78589818423518))*0.6164752278747426, -3.4360494375005417), 0.6164752278747426, LInfo(true, vec3(0.3907444361732878, 0.6304419950379317, 0.4642879656974612), vec3(0.510878155932153, 0.17801896592737765, 0.3965940840364499), false)),
			Sphere(vec3(1.2073590578078761, 0.13634045562128633 + abs(cos(tick/149.57889630230105+171.37053260090735))*0.13634045562128633, 4.54515188655038), 0.13634045562128633, LInfo(true, vec3(0.9131849489183667, 0.9750436505090028, 0.34037135686654096), vec3(0.6328172244792956, 0.36688064432828826, 0.6438489163374295), false)),
			Sphere(vec3(-4.953625786524729, 0.12527548193462856 + abs(cos(tick/173.7576569502841+111.54800127543605))*0.12527548193462856, -0.5739280763337997), 0.12527548193462856, LInfo(true, vec3(0.5414427903139428, 0.5087115036445827, 0.6013232632736967), vec3(0.07405452823543868, 0.9741964997819006, 0.5508906194685549), false)),
			Sphere(vec3(1.9659632624958505, 0.1542280836379757 + abs(cos(tick/83.04925551060857+237.3696097968859))*0.1542280836379757, 0.4224789151368413), 0.1542280836379757, LInfo(true, vec3(0.777901544656707, 0.7933167707958025, 0.9705192847719646), vec3(0.18730764270333866, 0.8130482041234921, 0.46994092595903425), false)),
			Sphere(vec3(4.593069849552214, 0.5589150408906488 + abs(cos(tick/62.049251414483344+131.72771788233837))*0.5589150408906488, -0.6086919855312741), 0.5589150408906488, LInfo(true, vec3(0.46725437777925527, 0.3169520779211551, 0.23154867627528353), vec3(0.6831555135551813, 0.5790038588598466, 0.3467372747586551), false)),
			Sphere(vec3(1.1609423560713645, 0.2480546860564411 + abs(cos(tick/2.701576956462426+245.82758377175935))*0.2480546860564411, 2.623028589911712), 0.2480546860564411, LInfo(true, vec3(0.5755964125849444, 0.5878819650588142, 0.10716639201138778), vec3(0.8304234074544063, 0.20545923337311256, 0.5261997072342036), false)),
			Sphere(vec3(0.4692205996325869, 0.3473225120362251 + abs(cos(tick/84.53973826562888+125.96808238846046))*0.3473225120362251, 2.283510170617262), 0.3473225120362251, LInfo(true, vec3(0.9843218886442702, 0.2875502070189947, 0.5296199169830533), vec3(0.05562778982140404, 0.6368403303744004, 0.49316618356782127), false))
);

/// BASIC FUNTIONS ///

int mod(int a, int b)
{
	while (a < 0)
	{
	    a += b;
	}
	return a - (b * int(float(a)/float(b)));
}

float lenght(vec3 vec)
{
    return sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
}
float dist(vec3 a, vec3 b)
{
    vec3 ab = a - b;
    return lenght(ab);
}
bool any(vec3 v)
{
	return !((v.x == 0.0) && (v.y == 0.0) && (v.z == 0.0));
}
vec3 normalize(vec3 vec)
{
    float len = lenght(vec);
    if (len != 0.0)
    {
        return vec3(vec.x/len, vec.y/len, vec.z/len);
    }
    return vec;
}

float dot(vec3 a, vec3 b)
{
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

float custom_atan2(float y, float x)
{
	return 2.0 * atan((y)/(sqrt(x*x + y*y) + x));
}

vec2 dir_to_uv(vec3 dir)
{
	float u = 0.5 + custom_atan2(dir.x, dir.z)/(2.0*PI);
	float v = 0.5 - asin(dir.y)/PI;
	return vec2(u, v);
}

vec3 rotate_y_axis(vec3 v, float angle)
{
	vec3 newV = v;
	newV.x = v.x * cos(angle) - v.z * sin(angle);
	newV.z = v.x * sin(angle) + v.z * cos(angle);
	return newV;
}

vec3 rotate_x_axis(vec3 v, float angle)
{
	vec3 newV = v;
	newV.y = v.y * cos(angle) - v.z * sin(angle);
	newV.z = v.y * sin(angle) + v.z * cos(angle);
	return newV;
}

/// RAYTRACING FUNCTIONS ///

Hit intersect_sphere(Ray ray, Hit bestHit, Sphere sphere)
{
    vec3 d = ray.pos - sphere.pos;
    float p1 = -dot(ray.dir, d);
    float p2sqr = p1 * p1 - dot(d, d) + sphere.radius * sphere.radius;
    if (p2sqr < 0.0)
    {
        return bestHit;
    }
    float p2 = sqrt(p2sqr);
    float t = p1 - p2 > 0.0 ? p1 - p2 : p1 + p2;
    if (t > 0 && t < bestHit.dist)
    {
    	Hit newBestHit;
        newBestHit.dist = t;
        newBestHit.pos = ray.pos + t * ray.dir;
        newBestHit.normal = normalize(newBestHit.pos - sphere.pos);
        newBestHit.oType = O_SPHERE;
        newBestHit.info = sphere.info;
        return newBestHit;
    }
    return bestHit;
}

Hit intersect_ground(Ray ray, Hit bestHit, Plane plane)
{
	float t = -ray.pos.y / ray.dir.y;
	if (t > 0 && t < bestHit.dist)
	{
		Hit newBestHit;
		newBestHit.dist = t;
		newBestHit.pos = ray.pos + t * ray.dir;
		newBestHit.normal = vec3(0.0,1.0,0.0);
		newBestHit.oType = O_PLANE;
		newBestHit.info = plane.info;
		return newBestHit;
	}
	return bestHit;
}

Hit get_hit(Ray ray)
{
	Hit bestHit = create_hit();
	Plane p = Plane(LInfo(true, vec3(0.1), vec3(0.4), true));
	bestHit = intersect_ground(ray, bestHit, p);

	// Sphere s = Sphere(vec3(x/1.5,cos(float(tick+x*z*5)/100.0)+3, z/1.5), 1.0, LInfo(false, vec3(0.0	), vec3(0.6)));
	
	for (int i = 0; i < SPHERES_NB; ++i)
	{
		bestHit = intersect_sphere(ray, bestHit, spheres[i]);
	}

	return bestHit;
}

ShadeResult shade(Hit hit, Ray ray)
{
	ShadeResult shadeRes;
	shadeRes.ray = ray;
	shadeRes.inShadow = false;
	shadeRes.hitSky = false;
	if (hit.dist < POS_INF)
	{
		shadeRes.color = hit.info.albedo;
		shadeRes.ray.pos = hit.pos + hit.normal * 0.001;
		shadeRes.ray.dir = reflect(ray.dir, hit.normal);
		shadeRes.ray.energy *= hit.info.specular;
			// shadeRes.color = clamp(dot(hit.normal, lightPos), 0, 1) * 0.5 * hit.info.albedo;
		// shadeRes.color = clamp(dot(hit.normal, lightPos), 0, 1) * 1 * hit.info.albedo;
		// shadeRes.color = hit.info.albedo;
		if (hit.info.isCheckerBoard && dist(hit.pos, camPos) < 500)
		{
			shadeRes.color = vec3(0.7);
			if (mod(int(floor(hit.pos.x)),2) != mod(int(floor(hit.pos.z)), 2))
			{
				shadeRes.color = vec3(0.3);
			}
		}
		if (hit.info.affectedByShadow)
		{
			float distLightRay = dist(shadeRes.ray.pos, lightPos);
			Hit shadowHit = get_hit(create_ray(shadeRes.ray.pos, normalize(lightPos - shadeRes.ray.pos)));
			if (shadowHit.dist < POS_INF)
			{
				shadeRes.color *= 0.6;
				shadeRes.inShadow = true;
			}
		}
		return shadeRes;
	}

	shadeRes.ray.energy *= 0.0;
	shadeRes.hitSky = true;
	shadeRes.color = vec3(texture2D(skyboxTex, dir_to_uv(ray.dir)));
	return shadeRes;
}

vec3 render_scene(Ray startRay)
{
	vec3 final = vec3(0.0);
	Ray currentRay = startRay;
	// bool hasShadow = false;
    for (int i = 0; i < 8; i++)
    {
        Hit hit = get_hit(currentRay);
        ShadeResult shadeRes = shade(hit, currentRay);
        final += currentRay.energy * shadeRes.color;
        currentRay = shadeRes.ray;
        if (!any(currentRay.energy) || shadeRes.inShadow)
        {
        	break;
        }
    }
    // final = get_hit(currentRay).info.albedo;
    return final;
}

void main()
{
    vec4 pixel = vec4(0.0);
    vec2 pos = gl_TexCoord[0].xy*texSize;
    pos.y = texSize.y - pos.y;
    pos = (pos - texSize*0.5f)/texSize.y;
    vec3 uvDir = normalize(vec3(pos.x, pos.y, 1.0));
    uvDir = normalize(rotate_y_axis(uvDir, angleCamX));
    // uvDir = normalize(rotate_x_axis(uvDir, -angleCamY));
    Ray ray = create_ray(camPos, uvDir);
    pixel = vec4(render_scene(ray), 1.0);

    gl_FragColor = gl_Color * pixel;
}