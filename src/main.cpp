#include <SFML/Graphics.hpp>

#include "utils.h"

sf::Vector3f vec_form_two_angles(float b, float a)
{
    sf::Vector3f f;
    f.y = cos(a) * cos(b);
    f.x = sin(a) * cos(b);
    f.z = sin(b);
    return f;
}

sf::Vector3f vec_xz_from_angle(float a)
{
    sf::Vector2f k(cos(a), sin(a));
    return sf::Vector3f(k.x, 0, k.y);
}

int main()
{
    std::srand(static_cast<unsigned int>(std::time(NULL)));

    sf::RenderWindow window(sf::VideoMode(SCREEN_W, SCREEN_H, 32), "Raymarch", sf::Style::Titlebar);
    window.setVerticalSyncEnabled(true);
    window.setMouseCursorVisible(false);

    sf::Sprite renderSprt;
    sf::RenderTexture renderTex;
    renderTex.create(SCREEN_W, SCREEN_H);
    renderTex.setSmooth(true);
    renderSprt.setTexture(renderTex.getTexture());
    renderTex.clear();

    sf::Vector3f camPos(0.f, 3.f, -7.f);
    int tick = 0;
    sf::Vector2f mousePos;
    sf::Vector2f lastMousePos;
    float angleCamX = 0.f;
    float angleCamY = 0.f;
    sf::Vector3f camDir;

    sf::Shader* pathTracing = new sf::Shader;
    pathTracing->loadFromFile("res/pathtracing.frag", sf::Shader::Fragment);
    pathTracing->setUniform("texSize", sf::Vector2f((float)SCREEN_W, (float)SCREEN_H));
    sf::Texture skyboxTex;
    skyboxTex.loadFromFile("res/skybox.jpg");
    pathTracing->setUniform("skyboxTex", skyboxTex);

    while (window.isOpen())
    {
    	mousePos = sf::Vector2f(sf::Mouse::getPosition(window));
        sf::Event event;
        while (window.pollEvent(event))
        {
            if ((event.type == sf::Event::Closed) || ((event.type == sf::Event::KeyPressed) && (event.key.code == sf::Keyboard::Escape)))
            {
                window.close();
                break;
            }

            if ((event.type == sf::Event::KeyPressed))
            {
                if (event.key.code == sf::Keyboard::Space)
                {
                	camPos.y += .2f;
                }
                if (event.key.code == sf::Keyboard::Tab)
                {
                    camPos.y -= .2f;
                }
                if (event.key.code == sf::Keyboard::D)
                {
                    camPos += vec_xz_from_angle(angleCamX) * 0.2f;
                }
                if (event.key.code == sf::Keyboard::Q)
                {
                    camPos -= vec_xz_from_angle(angleCamX) * 0.2f;
                }
                if (event.key.code == sf::Keyboard::Z)
                {
                    camPos -= vec_xz_from_angle(angleCamX - PI/2.f) * 0.2f;
                }
                if (event.key.code == sf::Keyboard::S)
                {
                    camPos += vec_xz_from_angle(angleCamX - PI/2.f) * 0.2f;
                }
            }
        }
        tick++;
        if (window.hasFocus())
        {
            float angleCamChange = (mousePos.x - lastMousePos.x)/100.f;
            angleCamX = mod_2pi(angleCamX + angleCamChange);
            angleCamChange = (mousePos.y - lastMousePos.y)/100.f;
            angleCamY = mod_2pi(angleCamY + angleCamChange);
            sf::Mouse::setPosition(sf::Vector2i(SCREEN_W/2, SCREEN_H/2), window);
        }
        mousePos = sf::Vector2f(sf::Mouse::getPosition(window));
        pathTracing->setUniform("camPos", camPos);
        pathTracing->setUniform("tick", tick);
        pathTracing->setUniform("angleCamX", angleCamX);
        pathTracing->setUniform("angleCamY", angleCamY);
        window.draw(renderSprt, pathTracing);
        window.display();

        lastMousePos = mousePos;
    }
    return EXIT_SUCCESS;
}
