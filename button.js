const _animatables = {};

class Animatable
{
    _onClick(e)
    {
        const funcs = this.state%2==1 ? this.offEvents : this.onEvents;
        this.state += 1;
        for (const [id,func] of Object.entries(funcs))
        {
            func(e, this.state)
        }
    }

    constructor(id)
    {
        this.id = id;
        this.onEvents = {}
        this.offEvents = {}
        this.onIds = 0;
        this.offIds = 0;
        this.state = 0;
        _animatables[this.id] = this;

        // we want to pass down e so forced to use function(e) instead of e =>
        //      as using this in later gives class instance
        $(`#${this.id}`).on('click', function(e) {
            const id = $(this).attr('id');
            if (id in _animatables) _animatables[id]._onClick(e);
            else throw new Error(`didn't find ${id} in _animatables`)
        });
    }

    addOnFunc(func)
    {
        this.onEvents[this.onIds] = func;
        const oldId = this.onIds;
        this.onIds += 1;
        return oldId;
    }

    addOffFunc(func)
    {
        this.offEvents[this.offIds] = func;
        const oldId = this.offIds;
        this.offIds += 1;
        return oldId;
    }

    removeOnFunc(id)
    {
        if (!(id in this.onEvents)) throw new Error(`key ${id} not in on funcs`)
        delete this.onEvents[id]
    }

    removeOnFunc(id)
    {
        if (!(id in this.offEvents)) throw new Error(`key ${id} not in off funcs`)
        delete this.offEvents[id]
    }
};

class Button extends Animatable
{
    _transitionFunction(e, state)
    {   
        const children = $(e.currentTarget).children();
        const text1 = children[0];
        const text2 = children[1];

        if (state%2==1)
        {
            $(text1)
                .removeClass(`text-anim-start text-anim-in`)
                .addClass(`text-anim-mid text-anim-out`);
            $(text2)
                .removeClass(`text-anim-out`)
                .addClass(`text-anim-in`);
        }
        else
        {
            $(text1)
                .removeClass(`text-anim-mid text-anim-out`)
                .addClass(`text-anim-start text-anim-in`);
            $(text2)
                .removeClass(`text-anim-in`)
                .addClass(`text-anim-out`);
        }
    }

    enableAnim()
    {
        this.addOnFunc(this._transitionFunction);
        this.addOffFunc(this._transitionFunction)
    }
};

class Menu extends Animatable
{
    _transitionFunction(e, state)
    {
        const children = $(e.currentTarget).parent().children();
        const content = children[1]; 
        console.log(e)
        if (state%2==1)
        {
            console.log(content, e)
            $(content)
                .removeClass('menu-anim-mid menu-anim-out no-pointer')
                .addClass(`menu-anim-in menu-anim-start`);
        }
        else
        {
            $(content)
                .removeClass('menu-anim-start menu-anim-in')
                .addClass('menu-anim-mid menu-anim-out no-pointer');
        }
    }

    enableAnim()
    {
        this.addOnFunc(this._transitionFunction);
        this.addOffFunc(this._transitionFunction);
    }
};
